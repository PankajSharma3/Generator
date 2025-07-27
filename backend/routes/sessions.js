const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const { validate, createSessionSchema, updateSessionSchema } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get user sessions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sessions = await Session.find(query)
      .sort({ lastAccessed: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-chatHistory -componentHistory');

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting sessions'
    });
  }
});

// @route   GET /api/sessions/recent
// @desc    Get recent sessions
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const sessions = await Session.getRecentSessions(req.user._id, 5);

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get recent sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting recent sessions'
    });
  }
});

// @route   POST /api/sessions
// @desc    Create new session
// @access  Private
router.post('/', auth, validate(createSessionSchema), async (req, res) => {
  try {
    const { name, description } = req.body;

    const session = new Session({
      userId: req.user._id,
      name,
      description,
      chatHistory: [],
      componentHistory: []
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating session'
    });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.getSessionWithHistory(req.params.id, req.user._id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update last accessed
    await session.touch();

    res.json({
      success: true,
      data: { session }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting session'
    });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update session
// @access  Private
router.put('/:id', auth, validate(updateSessionSchema), async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (settings) updateFields.settings = settings;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...updateFields, lastAccessed: new Date() },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating session'
    });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.softDelete();

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting session'
    });
  }
});

// @route   POST /api/sessions/:id/duplicate
// @desc    Duplicate session
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalSession = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!originalSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const duplicatedSession = new Session({
      userId: req.user._id,
      name: `${originalSession.name} (Copy)`,
      description: originalSession.description,
      chatHistory: originalSession.chatHistory,
      currentComponent: originalSession.currentComponent,
      componentHistory: originalSession.componentHistory,
      settings: originalSession.settings
    });

    await duplicatedSession.save();

    res.status(201).json({
      success: true,
      message: 'Session duplicated successfully',
      data: { session: duplicatedSession }
    });

  } catch (error) {
    console.error('Duplicate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error duplicating session'
    });
  }
});

// @route   GET /api/sessions/:id/export
// @desc    Export session data
// @access  Private
router.get('/:id/export', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).populate('userId', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const exportData = {
      sessionInfo: {
        name: session.name,
        description: session.description,
        createdAt: session.createdAt,
        lastAccessed: session.lastAccessed
      },
      chatHistory: session.chatHistory,
      currentComponent: session.currentComponent,
      componentHistory: session.componentHistory,
      metadata: session.metadata,
      exportedAt: new Date(),
      exportedBy: {
        name: `${session.userId.firstName} ${session.userId.lastName}`,
        email: session.userId.email
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="session-${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json"`);
    
    res.json(exportData);

  } catch (error) {
    console.error('Export session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting session'
    });
  }
});

// @route   POST /api/sessions/import
// @desc    Import session data
// @access  Private
router.post('/import', auth, async (req, res) => {
  try {
    const { sessionData, name } = req.body;

    if (!sessionData || !name) {
      return res.status(400).json({
        success: false,
        message: 'Session data and name are required'
      });
    }

    const session = new Session({
      userId: req.user._id,
      name,
      description: sessionData.sessionInfo?.description || 'Imported session',
      chatHistory: sessionData.chatHistory || [],
      currentComponent: sessionData.currentComponent,
      componentHistory: sessionData.componentHistory || [],
      settings: sessionData.settings || {}
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session imported successfully',
      data: { session }
    });

  } catch (error) {
    console.error('Import session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error importing session'
    });
  }
});

module.exports = router;