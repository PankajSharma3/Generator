const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// OpenRouter configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

// @route   POST /api/ai/generate
// @desc    Generate component code from user prompt
// @access  Private
router.post('/generate',
  [
    body('sessionId').isMongoId(),
    body('prompt').isLength({ min: 1 }).trim(),
    body('images').optional().isArray()
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

      const { sessionId, prompt, images } = req.body;

      // Find the session
      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id,
        isActive: true
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Add user message to chat history
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        images: images || []
      };

      session.chatHistory.push(userMessage);

      // Prepare system prompt for component generation
      const systemPrompt = `You are an expert React component generator. Generate clean, modern, and functional React components based on user requirements.

IMPORTANT GUIDELINES:
1. Always return valid JSX/TSX code that can be rendered directly
2. Include all necessary imports at the top
3. Use modern React patterns (functional components, hooks)
4. Generate accompanying CSS that makes the component look polished and modern
5. Ensure the component is responsive and accessible
6. If modifying existing code, preserve the structure and only make requested changes
7. Use semantic HTML elements where appropriate
8. Include proper ARIA attributes for accessibility

Current session context:
- Existing JSX: ${session.currentCode.jsx || 'None'}
- Existing CSS: ${session.currentCode.css || 'None'}
- TypeScript mode: ${session.currentCode.typescript ? 'Yes' : 'No'}

Return your response in the following JSON format:
{
  "jsx": "// Complete JSX/TSX component code here",
  "css": "/* Complete CSS styles here */",
  "explanation": "Brief explanation of what was generated/changed"
}`;

      try {
        // Call OpenRouter API
        const response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: DEFAULT_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'Component Generator Platform'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        
        // Parse the AI response to extract code
        let parsedResponse;
        try {
          // Try to extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: extract code blocks
            const jsxMatch = aiResponse.match(/```(?:jsx|tsx|javascript|typescript)?\n?([\s\S]*?)```/);
            const cssMatch = aiResponse.match(/```css\n?([\s\S]*?)```/);
            
            parsedResponse = {
              jsx: jsxMatch ? jsxMatch[1].trim() : session.currentCode.jsx,
              css: cssMatch ? cssMatch[1].trim() : session.currentCode.css,
              explanation: 'Component generated successfully'
            };
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          throw new Error('Failed to parse AI response');
        }

        // Update session code
        session.currentCode.jsx = parsedResponse.jsx || session.currentCode.jsx;
        session.currentCode.css = parsedResponse.css || session.currentCode.css;

        // Add AI response to chat history
        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: parsedResponse.explanation || 'Component generated successfully',
          timestamp: new Date(),
          images: []
        };

        session.chatHistory.push(assistantMessage);
        await session.save();

        res.json({
          success: true,
          message: 'Component generated successfully',
          code: session.currentCode,
          explanation: parsedResponse.explanation,
          chatMessage: assistantMessage
        });

      } catch (aiError) {
        console.error('AI API Error:', aiError.response?.data || aiError.message);
        
        // Add error message to chat
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while generating the component. Please try again.',
          timestamp: new Date(),
          images: []
        };

        session.chatHistory.push(errorMessage);
        await session.save();

        return res.status(500).json({
          success: false,
          message: 'Failed to generate component',
          chatMessage: errorMessage
        });
      }

    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/refine
// @desc    Refine existing component based on user feedback
// @access  Private
router.post('/refine',
  [
    body('sessionId').isMongoId(),
    body('prompt').isLength({ min: 1 }).trim(),
    body('targetElement').optional().isString()
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

      const { sessionId, prompt, targetElement } = req.body;

      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id,
        isActive: true
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Add user refinement request to chat
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        images: []
      };

      session.chatHistory.push(userMessage);

      // Prepare refinement prompt
      const refinementPrompt = `Refine the existing React component based on the user's request. 

Current component:
JSX: ${session.currentCode.jsx}
CSS: ${session.currentCode.css}

User request: ${prompt}
${targetElement ? `Target element: ${targetElement}` : ''}

Make only the requested changes while preserving the existing functionality. Return the complete updated code in JSON format:
{
  "jsx": "// Updated JSX code",
  "css": "/* Updated CSS code */",
  "explanation": "Brief explanation of changes made"
}`;

      try {
        const response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: DEFAULT_MODEL,
            messages: [
              { role: 'user', content: refinementPrompt }
            ],
            temperature: 0.5,
            max_tokens: 4000
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'Component Generator Platform'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        
        let parsedResponse;
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('Failed to parse refinement response:', parseError);
          throw new Error('Failed to parse AI response');
        }

        // Update session code
        session.currentCode.jsx = parsedResponse.jsx || session.currentCode.jsx;
        session.currentCode.css = parsedResponse.css || session.currentCode.css;

        // Add AI response to chat
        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: parsedResponse.explanation || 'Component refined successfully',
          timestamp: new Date(),
          images: []
        };

        session.chatHistory.push(assistantMessage);
        await session.save();

        res.json({
          success: true,
          message: 'Component refined successfully',
          code: session.currentCode,
          explanation: parsedResponse.explanation,
          chatMessage: assistantMessage
        });

      } catch (aiError) {
        console.error('AI Refinement Error:', aiError.response?.data || aiError.message);
        
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while refining the component. Please try again.',
          timestamp: new Date(),
          images: []
        };

        session.chatHistory.push(errorMessage);
        await session.save();

        return res.status(500).json({
          success: false,
          message: 'Failed to refine component',
          chatMessage: errorMessage
        });
      }

    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/ai/models
// @desc    Get available AI models
// @access  Private
router.get('/models', async (req, res) => {
  const models = [
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast and efficient for component generation'
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fast and lightweight'
    },
    {
      id: 'meta-llama/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B',
      description: 'Open source alternative'
    },
    {
      id: 'google/gemma-2-9b-it',
      name: 'Gemma 2 9B',
      description: 'Google\'s efficient model'
    }
  ];

  res.json({
    success: true,
    models
  });
});

module.exports = router;