const express = require('express');
const upload = require('../config/multer');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  getUserComplaints,
  updateComplaint,
  deleteComplaint,
  getAdminComplaints,
} = require('../controllers/complaintController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getComplaints).post(protect, upload.single('image'), createComplaint);

router.get('/user/:id', protect, getUserComplaints);

router.get('/admin/complaints', protect, authorizeRoles('admin'), getAdminComplaints);

router
  .route('/:id')
  .get(protect, getComplaintById)
  .patch(protect, authorizeRoles('admin'), updateComplaint)
  .delete(protect, authorizeRoles('admin'), deleteComplaint);

module.exports = router;

