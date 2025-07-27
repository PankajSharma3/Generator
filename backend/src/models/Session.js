const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  images: [{
    type: String // Base64 encoded images
  }]
});

const componentCodeSchema = new mongoose.Schema({
  jsx: {
    type: String,
    default: ''
  },
  css: {
    type: String,
    default: ''
  },
  typescript: {
    type: Boolean,
    default: false
  }
});

const uiStateSchema = new mongoose.Schema({
  selectedElement: {
    type: String,
    default: null
  },
  propertyPanelOpen: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    enum: ['jsx', 'css', 'preview'],
    default: 'preview'
  },
  zoom: {
    type: Number,
    default: 1,
    min: 0.1,
    max: 3
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  chatHistory: [chatMessageSchema],
  currentCode: componentCodeSchema,
  uiState: uiStateSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Update lastAccessed on any modification
sessionSchema.pre('save', function(next) {
  this.lastAccessed = new Date();
  next();
});

// Index for efficient queries
sessionSchema.index({ userId: 1, updatedAt: -1 });
sessionSchema.index({ userId: 1, title: 'text' });

module.exports = mongoose.model('Session', sessionSchema);