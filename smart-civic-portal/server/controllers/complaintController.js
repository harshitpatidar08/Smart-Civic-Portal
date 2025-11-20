const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

const buildFilters = (query) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.category) filters.category = query.category;
  if (query.priority) filters.priority = query.priority;
  return filters;
};

exports.createComplaint = async (req, res, next) => {
  try {
    const {
      issueTitle,
      description,
      latitude,
      longitude,
      category = 'other',
      priority = 'medium',
      city,
      area,
      landmark,
    } = req.body;

    // VALIDATION → Allow either coordinates OR manual location
    if ((!latitude || !longitude) && !city && !landmark) {
      const error = new Error(
        'Please provide either coordinates OR city/landmark for location.'
      );
      error.statusCode = 400;
      throw error;
    }

    const complaint = await Complaint.create({
      issueTitle,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
      city,
      area,
      landmark,
      category,
      priority,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};


exports.getComplaints = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    const complaints = await Complaint.find(filters)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      results: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};


exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};


exports.getUserComplaints = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      const error = new Error('Forbidden: cannot access other user complaints');
      error.statusCode = 403;
      throw error;
    }
    const complaints = await Complaint.find({ createdBy: id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, results: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const updates = (({ status, priority }) => ({
      status,
      priority,
    }))(req.body);

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    const complaint = await Complaint.findById(req.params.id).populate(
      'createdBy',
      'email name'
    );

    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(complaint, updates);
    await complaint.save();

    // Notify user by email
    if (updates.status || updates.priority) {
      sendEmail({
        to: complaint.createdBy.email,
        subject: `Update on your complaint: ${complaint.issueTitle}`,
        text: `Status: ${complaint.status}\nPriority: ${complaint.priority}`,
      });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};


exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      const error = new Error('Complaint not found');
      error.statusCode = 404;
      throw error;
    }
    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint removed' });
  } catch (error) {
    next(error);
  }
};

exports.getAdminComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .sort({ priority: -1, createdAt: -1 })
      .populate('createdBy', 'name email phone');
    res.status(200).json({ success: true, results: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

