const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get all user sessions
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id, isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sessions = await Session.find(query)
      .select('title description createdAt updatedAt lastAccessed tags')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', 
  [
    body('title').isLength({ min: 1, max: 100 }).trim().escape(),
    body('description').optional().isLength({ max: 500 }).trim().escape()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, description, tags } = req.body;

      const session = new Session({
        userId: req.user._id,
        title,
        description,
        tags: tags || [],
        chatHistory: [],
        currentCode: {
          jsx: '',
          css: '',
          typescript: false
        },
        uiState: {
          selectedElement: null,
          propertyPanelOpen: false,
          activeTab: 'preview',
          zoom: 1
        }
      });

      await session.save();

      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        session
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/sessions/:id
// @desc    Get a specific session
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update last accessed
    session.lastAccessed = new Date();
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update session metadata
// @access  Private
router.put('/:id',
  [
    body('title').optional().isLength({ min: 1, max: 100 }).trim().escape(),
    body('description').optional().isLength({ max: 500 }).trim().escape()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, description, tags } = req.body;
      
      const updateFields = {};
      if (title) updateFields.title = title;
      if (description !== undefined) updateFields.description = description;
      if (tags) updateFields.tags = tags;

      const session = await Session.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id, isActive: true },
        updateFields,
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
        session
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/sessions/:id
// @desc    Delete a session (soft delete)
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/sessions/:id/chat
// @desc    Add a chat message to session
// @access  Private
router.post('/:id/chat',
  [
    body('role').isIn(['user', 'assistant']),
    body('content').isLength({ min: 1 }).trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { role, content, images } = req.body;

      const session = await Session.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      const chatMessage = {
        id: uuidv4(),
        role,
        content,
        timestamp: new Date(),
        images: images || []
      };

      session.chatHistory.push(chatMessage);
      await session.save();

      res.json({
        success: true,
        message: 'Chat message added',
        chatMessage
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/sessions/:id/code
// @desc    Update session code
// @access  Private
router.put('/:id/code',
  [
    body('jsx').optional().isString(),
    body('css').optional().isString(),
    body('typescript').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { jsx, css, typescript } = req.body;

      const session = await Session.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      if (jsx !== undefined) session.currentCode.jsx = jsx;
      if (css !== undefined) session.currentCode.css = css;
      if (typescript !== undefined) session.currentCode.typescript = typescript;

      await session.save();

      res.json({
        success: true,
        message: 'Code updated successfully',
        code: session.currentCode
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/sessions/:id/ui-state
// @desc    Update session UI state
// @access  Private
router.put('/:id/ui-state', async (req, res, next) => {
  try {
    const { selectedElement, propertyPanelOpen, activeTab, zoom } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (selectedElement !== undefined) session.uiState.selectedElement = selectedElement;
    if (propertyPanelOpen !== undefined) session.uiState.propertyPanelOpen = propertyPanelOpen;
    if (activeTab !== undefined) session.uiState.activeTab = activeTab;
    if (zoom !== undefined) session.uiState.zoom = Math.max(0.1, Math.min(3, zoom));

    await session.save();

    res.json({
      success: true,
      message: 'UI state updated successfully',
      uiState: session.uiState
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;