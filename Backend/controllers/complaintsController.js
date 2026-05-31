const supabase = require('../config/supabaseClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const { analyzeComplaint } = require('../services/aiService');
const { checkDuplicate } = require('../services/deduplicationService');
const { sendNotification } = require('../services/notificationService');

// Create a new complaint
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, latitude, longitude, district, image_url } = req.body;
    
    // Auth token extraction would go here
    const token = req.headers.authorization?.split(' ')[1];
    let user = null;
    if (token) {
      try {
        const { data } = await supabase.auth.getUser(token);
        user = data?.user;
      } catch (err) {}
    }
    
    // 1. DEDUPLICATION CHECK
    // Fetch recent complaints to compare against
    const { data: recentComplaints } = await supabase
      .from('complaints')
      .select('id, description')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (recentComplaints && recentComplaints.length > 0) {
      const duplicateResult = checkDuplicate(description, recentComplaints);
      if (duplicateResult.isDuplicate) {
        return errorResponse(res, 409, `Duplicate complaint detected (Similarity: ${duplicateResult.similarityScore}%). Matched ID: ${duplicateResult.matchedId}`);
      }
    }

    // 2. AI PRIORITY SCORING & CATEGORIZATION
    const aiResult = analyzeComplaint(title + ' ' + description);
    const finalCategory = category || aiResult.category; 
    const finalPriorityScore = aiResult.priority_score;

    // 3. DATABASE INSERT
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        { 
          title, 
          description, 
          category: finalCategory, 
          priority_score: finalPriorityScore, 
          status: 'pending', 
          latitude, 
          longitude, 
          district, 
          image_url,
          user_id: user ? user.id : null  
        }
      ])
      .select();

    if (error) return errorResponse(res, 400, error.message);

    // 4. TRIGGER NOTIFICATION
    sendNotification('COMPLAINT_CREATED', {
      userEmail: user?.email,
      title: title,
      priority: finalPriorityScore 
    });

    return successResponse(res, 201, 'Complaint submitted successfully', data[0]);
  } catch (error) {
    next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user = null;
    if (token) {
      try {
        const { data } = await supabase.auth.getUser(token);
        user = data?.user;
      } catch (err) {}
    }

    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });

    if (user) {
      // If authenticated, maybe fetch all anyway for citizen dashboard to see community reporting
      // or just filter for their own. For now, fetch all so the map/dashboard is populated.
      // We will remove the eq('user_id') filter for the scaffold to show persistence.
    }

    const { data, error } = await query;

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'Complaints fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints
};
