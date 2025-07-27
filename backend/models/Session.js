const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
  metadata: {
    model: String,
    tokens: Number,
    processingTime: Number,
    images: [String] // URLs or base64 strings for user uploaded images
  }
});

const componentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  jsx: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  props: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    messageId: String,
    prompt: String
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Session name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  chatHistory: [messageSchema],
  currentComponent: componentSchema,
  componentHistory: [componentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  settings: {
    model: {
      type: String,
      default: 'gpt-4o-mini'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 2000
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokensUsed: {
      type: Number,
      default: 0
    },
    componentsGenerated: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, lastAccessed: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ 'chatHistory.timestamp': -1 });

// Update lastAccessed on every access
sessionSchema.methods.touch = function() {
  this.lastAccessed = new Date();
  return this.save();
};

// Add message to chat history
sessionSchema.methods.addMessage = function(message) {
  this.chatHistory.push(message);
  this.metadata.totalMessages = this.chatHistory.length;
  
  // Update token usage if provided
  if (message.metadata && message.metadata.tokens) {
    this.metadata.totalTokensUsed += message.metadata.tokens;
  }
  
  this.lastAccessed = new Date();
  return this.save();
};

// Update current component
sessionSchema.methods.updateComponent = function(component) {
  // Save current component to history if it exists
  if (this.currentComponent) {
    this.componentHistory.push(this.currentComponent);
  }
  
  this.currentComponent = component;
  this.metadata.componentsGenerated += 1;
  this.lastAccessed = new Date();
  
  return this.save();
};

// Get recent sessions for a user
sessionSchema.statics.getRecentSessions = function(userId, limit = 10) {
  return this.find({ userId, isActive: true })
    .sort({ lastAccessed: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Get session with full chat history
sessionSchema.statics.getSessionWithHistory = function(sessionId, userId) {
  return this.findOne({ _id: sessionId, userId })
    .populate('userId', 'firstName lastName email');
};

// Soft delete session
sessionSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);