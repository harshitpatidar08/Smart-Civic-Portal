const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get all escalated complaints across the state
router.get('/escalated', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('status', 'escalated')
      .order('created_at', { ascending: true });

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'Escalated complaints fetched', data);
  } catch (error) {
    next(error);
  }
});

// District performance metrics
router.get('/metrics', async (req, res, next) => {
  try {
    // A real implementation would group by district and calculate average resolution time
    // using Supabase RPC or complex query. Here we return mock overview for the scaffold.
    const { data, error } = await supabase
      .from('complaints')
      .select('district, status');

    if (error) return errorResponse(res, 400, error.message);

    const metrics = data.reduce((acc, curr) => {
      acc[curr.district] = acc[curr.district] || { total: 0, resolved: 0, pending: 0, escalated: 0 };
      acc[curr.district].total++;
      acc[curr.district][curr.status]++;
      return acc;
    }, {});

    return successResponse(res, 200, 'State metrics fetched', metrics);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
