const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { isWithinResolutionRadius } = require('../services/geoService');
const { sendNotification } = require('../services/notificationService');

// Get complaints for a district admin
router.get('/complaints', async (req, res, next) => {
  try {
    const { district } = req.query; // Usually taken from admin's authenticated profile
    
    if (!district) return errorResponse(res, 400, 'District is required');

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('district', district)
      .order('priority_score', { ascending: false });

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'District complaints fetched', data);
  } catch (error) {
    next(error);
  }
});

// Get all field officers
router.get('/field-officers', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'field_officer');

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'Field officers fetched', data);
  } catch (error) {
    next(error);
  }
});

// Get district admins
router.get('/district-admins', async (req, res, next) => {
  try {
    let query = supabase.from('users').select('*').eq('role', 'district_admin');
    // If state is needed, we could filter it here by fetching the user profile first.
    const { data, error } = await query;
    if (error) return errorResponse(res, 400, error.message);
    return successResponse(res, 200, 'District admins fetched', data);
  } catch (error) {
    next(error);
  }
});

// Create district admin
router.post('/district-admins', async (req, res, next) => {
  try {
    const { name, email, password, district } = req.body;
    let state = '';
    
    // Attempt to extract State from caller's token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (user && !authErr) {
        const { data: callerData } = await supabase.from('users').select('state').eq('id', user.id).single();
        if (callerData && callerData.state) {
          state = callerData.state;
        }
      }
    }

    // Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'district_admin', district, state }
      }
    });

    if (authError) return errorResponse(res, 400, authError.message);

    // Insert into users table
    const { data: newUserData, error: userError } = await supabase
      .from('users')
      .insert([{ id: authData.user.id, email, name, role: 'district_admin', district, state }]);

    if (userError) return errorResponse(res, 400, userError.message);

    const createdUser = { id: authData.user.id, name, email, district, status: 'active', last_login: 'Never' };
    return successResponse(res, 201, 'District admin created successfully', createdUser);
  } catch (error) {
    next(error);
  }
});

// Assign complaint to field officer
router.put('/complaints/:id/assign', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    if (!officer_id) return errorResponse(res, 400, 'officer_id is required');

    const { data, error } = await supabase
      .from('complaints')
      .update({ assigned_to: officer_id })
      .eq('id', id)
      .select('assigned_to, users!complaints_assigned_to_fkey(name)'); // Assuming foreign key mapping or we will just return the id

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'Officer assigned successfully', data[0]);
  } catch (error) {
    next(error);
  }
});

// Get admin notes for a complaint (Admin only)
router.get('/complaints/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('complaint_notes')
      .select('id, note, created_at, users(name, email)')
      .eq('complaint_id', id)
      .order('created_at', { ascending: false });

    if (error) return errorResponse(res, 400, error.message);
    return successResponse(res, 200, 'Admin notes fetched', data);
  } catch (error) {
    next(error);
  }
});

// Add admin note to a complaint (Admin only)
router.post('/complaints/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, admin_id } = req.body;

    if (!note || !note.trim()) return errorResponse(res, 400, 'Note text is required');

    const { data, error } = await supabase
      .from('complaint_notes')
      .insert({ complaint_id: id, note: note.trim(), admin_id })
      .select('id, note, created_at, users(name, email)');

    if (error) return errorResponse(res, 400, error.message);
    return successResponse(res, 201, 'Note added', data[0]);
  } catch (error) {
    next(error);
  }
});

// Update complaint status
router.put('/complaints/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolved_image_url, resolution_lat, resolution_lng } = req.body;

    // 1. GEO-FENCE VERIFICATION ON RESOLUTION
    if (status === 'resolved') {
      const { data: originData } = await supabase
        .from('complaints')
        .select('latitude, longitude')
        .eq('id', id)
        .single();

      if (originData && resolution_lat && resolution_lng) {
        const isValidLocation = isWithinResolutionRadius(
          originData.latitude, originData.longitude,
          resolution_lat, resolution_lng,
          30 // strict 30 meter radius geo-fence
        );
        if (!isValidLocation) {
          return errorResponse(res, 403, 'Geo-verification failed: Resolution location exceeds 30m radius from origin.');
        }
      } else if (!resolution_lat || !resolution_lng) {
        return errorResponse(res, 400, 'Geo-coordinates are strictly required for resolution verification.');
      }
    }

    // 2. UPDATE DATABASE STATUS
    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
      if (resolved_image_url) updateData.resolved_image_url = resolved_image_url;
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id)
      .select('title, users(email)');

    if (error) return errorResponse(res, 400, error.message);

    // 3. TRIGGER NOTIFICATION
    if (data && data.length > 0) {
      sendNotification('STATUS_UPDATED', {
        userEmail: data[0].users?.email,
        title: data[0].title,
        status: status
      });
    }

    return successResponse(res, 200, 'Complaint status updated', data[0]);
  } catch (error) {
    next(error);
  }
});

// SLA Stats for a district
router.get('/sla-stats', async (req, res, next) => {
  try {
    const { district } = req.query;
    if (!district) return errorResponse(res, 400, 'District is required');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('complaints')
      .select('id, status, created_at, resolved_at, priority_score')
      .eq('district', district)
      .gte('created_at', startOfMonth.toISOString());

    if (error) return errorResponse(res, 400, error.message);

    const SLA_DAYS = 7; // 7 day SLA target
    const total = data.length;
    let withinSla = 0;
    let breachedSla = 0;

    data.forEach(c => {
      if (c.status === 'resolved' && c.resolved_at) {
        const resolutionDays = (new Date(c.resolved_at) - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
        if (resolutionDays <= SLA_DAYS) withinSla++;
        else breachedSla++;
      } else if (c.status !== 'resolved') {
        const daysOpen = (new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
        if (daysOpen > SLA_DAYS) breachedSla++;
      }
    });

    const resolved = data.filter(c => c.status === 'resolved').length;
    const pending = data.filter(c => c.status === 'pending').length;
    const inProgress = data.filter(c => c.status === 'in_progress').length;
    const escalated = data.filter(c => c.status === 'escalated').length;
    const compliancePct = total === 0 ? 0 : Math.round(((total - breachedSla) / total) * 100);

    return successResponse(res, 200, 'SLA stats fetched', {
      total, resolved, pending, inProgress, escalated,
      withinSla, breachedSla, compliancePct, slaDays: SLA_DAYS
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
