const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    issueTitle: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    imageUrl: {
      type: String,
    },

    // GEO LOCATION (OPTIONAL NOW)
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },

    // NEW MANUAL LOCATION FIELDS
    city: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: ['road', 'garbage', 'streetlight', 'water', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
