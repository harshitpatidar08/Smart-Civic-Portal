const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/district-performance', analyticsController.getDistrictPerformance);
router.get('/hotspots', analyticsController.getHotspots);

module.exports = router;
