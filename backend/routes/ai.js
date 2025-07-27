const express = require('express');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');
const { validate, chatMessageSchema } = require('../middleware/validation');
const aiService = require('../services/aiService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @route   POST /api/ai/chat/:sessionId
// @desc    Send chat message and generate component
// @access  Private
router.post('/chat/:sessionId', auth, validate(chatMessageSchema), async (req, res) => {
  try {
    const { content, images } = req.body;
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Create user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: {
        images: images || []
      }
    };

    // Add user message to session
    await session.addMessage(userMessage);

    // Prepare chat history for AI
    const chatHistory = session.chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate component using AI
    const aiResponse = await aiService.generateComponent(content, {
      model: session.settings.model,
      temperature: session.settings.temperature,
      maxTokens: session.settings.maxTokens,
      chatHistory: chatHistory.slice(-10) // Last 10 messages for context
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: aiResponse.error || 'Failed to generate component'
      });
    }

    // Create assistant message
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Generated component: ${aiResponse.data.componentName}`,
      timestamp: new Date(),
      metadata: {
        model: aiResponse.metadata.model,
        tokens: aiResponse.metadata.tokens,
        processingTime: aiResponse.metadata.processingTime
      }
    };

    // Add assistant message to session
    await session.addMessage(assistantMessage);

    // Update component
    const component = {
      id: uuidv4(),
      name: aiResponse.data.componentName,
      jsx: aiResponse.data.jsx,
      css: aiResponse.data.css,
      props: aiResponse.data.props,
      version: 1,
      createdAt: new Date(),
      generatedBy: {
        messageId: assistantMessage.id,
        prompt: content
      }
    };

    await session.updateComponent(component);

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(sessionId).emit('message', assistantMessage);
      io.to(sessionId).emit('component-updated', component);
    }

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        component,
        session: {
          id: session._id,
          lastAccessed: session.lastAccessed,
          metadata: session.metadata
        }
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing chat message'
    });
  }
});

// @route   POST /api/ai/refine/:sessionId
// @desc    Refine existing component
// @access  Private
router.post('/refine/:sessionId', auth, validate(chatMessageSchema), async (req, res) => {
  try {
    const { content } = req.body;
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.currentComponent) {
      return res.status(400).json({
        success: false,
        message: 'No component to refine in this session'
      });
    }

    // Create user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: `Refine component: ${content}`,
      timestamp: new Date()
    };

    // Add user message to session
    await session.addMessage(userMessage);

    // Refine component using AI
    const aiResponse = await aiService.refineComponent(
      session.currentComponent,
      content,
      {
        model: session.settings.model,
        temperature: session.settings.temperature,
        maxTokens: session.settings.maxTokens
      }
    );

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: aiResponse.error || 'Failed to refine component'
      });
    }

    // Create assistant message
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Refined component: ${aiResponse.data.componentName}`,
      timestamp: new Date(),
      metadata: {
        model: aiResponse.metadata.model,
        tokens: aiResponse.metadata.tokens,
        processingTime: aiResponse.metadata.processingTime
      }
    };

    // Add assistant message to session
    await session.addMessage(assistantMessage);

    // Update component with new version
    const refinedComponent = {
      ...session.currentComponent,
      jsx: aiResponse.data.jsx,
      css: aiResponse.data.css,
      props: aiResponse.data.props,
      version: session.currentComponent.version + 1,
      createdAt: new Date(),
      generatedBy: {
        messageId: assistantMessage.id,
        prompt: content
      }
    };

    await session.updateComponent(refinedComponent);

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(sessionId).emit('message', assistantMessage);
      io.to(sessionId).emit('component-updated', refinedComponent);
    }

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        component: refinedComponent,
        session: {
          id: session._id,
          lastAccessed: session.lastAccessed,
          metadata: session.metadata
        }
      }
    });

  } catch (error) {
    console.error('Refine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error refining component'
    });
  }
});

// @route   GET /api/ai/models
// @desc    Get available AI models
// @access  Private
router.get('/models', auth, async (req, res) => {
  try {
    const models = [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and efficient model for component generation',
        provider: 'OpenAI'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Most capable model with advanced reasoning',
        provider: 'OpenAI'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Fast and efficient Anthropic model',
        provider: 'Anthropic'
      },
      {
        id: 'llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B',
        description: 'Open source model via OpenRouter',
        provider: 'Meta'
      }
    ];

    res.json({
      success: true,
      data: { models }
    });

  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting models'
    });
  }
});

// @route   POST /api/ai/test
// @desc    Test AI connection
// @access  Private
router.post('/test', auth, async (req, res) => {
  try {
    const testPrompt = "Create a simple hello world React component";
    
    const response = await aiService.generateComponent(testPrompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 500
    });

    res.json({
      success: response.success,
      message: response.success ? 'AI service is working correctly' : response.error,
      data: response.success ? {
        testGenerated: true,
        model: response.metadata?.model,
        processingTime: response.metadata?.processingTime
      } : null
    });

  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service test failed'
    });
  }
});

// @route   POST /api/ai/regenerate/:sessionId
// @desc    Regenerate current component with same prompt
// @access  Private
router.post('/regenerate/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.currentComponent || !session.currentComponent.generatedBy) {
      return res.status(400).json({
        success: false,
        message: 'No component to regenerate in this session'
      });
    }

    const originalPrompt = session.currentComponent.generatedBy.prompt;

    // Prepare chat history for AI
    const chatHistory = session.chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate component using AI with same prompt
    const aiResponse = await aiService.generateComponent(originalPrompt, {
      model: session.settings.model,
      temperature: session.settings.temperature + 0.1, // Slightly higher temp for variation
      maxTokens: session.settings.maxTokens,
      chatHistory: chatHistory.slice(-10)
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: aiResponse.error || 'Failed to regenerate component'
      });
    }

    // Create assistant message
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Regenerated component: ${aiResponse.data.componentName}`,
      timestamp: new Date(),
      metadata: {
        model: aiResponse.metadata.model,
        tokens: aiResponse.metadata.tokens,
        processingTime: aiResponse.metadata.processingTime
      }
    };

    // Add assistant message to session
    await session.addMessage(assistantMessage);

    // Update component
    const regeneratedComponent = {
      id: uuidv4(),
      name: aiResponse.data.componentName,
      jsx: aiResponse.data.jsx,
      css: aiResponse.data.css,
      props: aiResponse.data.props,
      version: session.currentComponent.version + 1,
      createdAt: new Date(),
      generatedBy: {
        messageId: assistantMessage.id,
        prompt: originalPrompt
      }
    };

    await session.updateComponent(regeneratedComponent);

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(sessionId).emit('message', assistantMessage);
      io.to(sessionId).emit('component-updated', regeneratedComponent);
    }

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        component: regeneratedComponent,
        session: {
          id: session._id,
          lastAccessed: session.lastAccessed,
          metadata: session.metadata
        }
      }
    });

  } catch (error) {
    console.error('Regenerate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error regenerating component'
    });
  }
});

module.exports = router;