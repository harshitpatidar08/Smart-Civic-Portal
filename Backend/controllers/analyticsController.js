const supabase = require('../config/supabaseClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getOverview = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('complaints').select('status');
    if (error) return errorResponse(res, 400, error.message);

    const stats = {
      total: data.length,
      pending: data.filter(c => c.status === 'pending').length,
      in_progress: data.filter(c => c.status === 'in_progress').length,
      resolved: data.filter(c => c.status === 'resolved').length,
      escalated: data.filter(c => c.status === 'escalated').length
    };

    return successResponse(res, 200, 'System analytics overview', stats);
  } catch (error) {
    next(error);
  }
};

const getDistrictPerformance = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('complaints').select('district, status');
    if (error) return errorResponse(res, 400, error.message);

    const districtMap = {};
    data.forEach((c) => {
      const d = c.district || 'Unknown';
      if (!districtMap[d]) districtMap[d] = { total: 0, resolved: 0, escalated: 0 };
      districtMap[d].total += 1;
      if (c.status === 'resolved') districtMap[d].resolved += 1;
      if (c.status === 'escalated') districtMap[d].escalated += 1;
    });

    const results = Object.keys(districtMap).map(key => ({
      name: key,
      ...districtMap[key],
      resolutionRate: ((districtMap[key].resolved / districtMap[key].total) * 100).toFixed(1)
    }));

    return successResponse(res, 200, 'District analytics fetched', results);
  } catch (error) {
    next(error);
  }
};

const getHotspots = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('id, title, category, priority_score, status, latitude, longitude, created_at, district');
    
    if (error) return errorResponse(res, 400, error.message);
    
    return successResponse(res, 200, 'Complaint hotspots', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getDistrictPerformance,
  getHotspots
};
