const OpenAI = require('openai');
const axios = require('axios');

class AIService {
  constructor() {
    this.openai = null;
    this.useOpenRouter = !!process.env.OPENROUTER_API_KEY;
    
    if (this.useOpenRouter) {
      this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
      this.baseURL = 'https://openrouter.ai/api/v1';
    } else if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('No AI API key provided. AI features will not work.');
    }
    
    this.defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  getSystemPrompt() {
    return `You are an expert React component generator. Your task is to create React components based on user descriptions.

IMPORTANT GUIDELINES:
1. Always return valid JSX code that can be rendered in React
2. Use modern React patterns (functional components, hooks)
3. Include proper CSS for styling
4. Make components responsive and accessible
5. Use semantic HTML elements
6. Add ARIA attributes where appropriate
7. Include proper TypeScript types if requested
8. Components should be self-contained and reusable

RESPONSE FORMAT:
You must respond with a JSON object containing:
{
  "jsx": "// Your JSX component code here",
  "css": "/* Your CSS styles here */",
  "componentName": "ComponentName",
  "description": "Brief description of the component",
  "props": {
    // Define any props the component accepts
  }
}

The JSX should be a complete functional component that can be directly rendered.
The CSS should contain all necessary styles for the component.
Use CSS classes that match the JSX structure.

EXAMPLE:
For "Create a blue button", respond with:
{
  "jsx": "import React from 'react';\\n\\nconst BlueButton = ({ children, onClick, disabled = false }) => {\\n  return (\\n    <button \\n      className=\\"blue-button\\" \\n      onClick={onClick}\\n      disabled={disabled}\\n      aria-label={children}\\n    >\\n      {children}\\n    </button>\\n  );\\n};\\n\\nexport default BlueButton;",
  "css": ".blue-button {\\n  background-color: #007bff;\\n  color: white;\\n  border: none;\\n  padding: 12px 24px;\\n  border-radius: 6px;\\n  font-size: 16px;\\n  font-weight: 500;\\n  cursor: pointer;\\n  transition: all 0.2s ease;\\n}\\n\\n.blue-button:hover:not(:disabled) {\\n  background-color: #0056b3;\\n  transform: translateY(-1px);\\n}\\n\\n.blue-button:disabled {\\n  opacity: 0.6;\\n  cursor: not-allowed;\\n}",
  "componentName": "BlueButton",
  "description": "A responsive blue button component with hover effects",
  "props": {
    "children": "React.ReactNode",
    "onClick": "() => void",
    "disabled": "boolean"
  }
}`;
  }

  async generateComponent(prompt, options = {}) {
    try {
      const {
        model = this.defaultModel,
        temperature = 0.7,
        maxTokens = 2000,
        chatHistory = []
      } = options;

      const messages = [
        { role: 'system', content: this.getSystemPrompt() },
        ...chatHistory.slice(-10), // Include last 10 messages for context
        { role: 'user', content: prompt }
      ];

      let response;
      const startTime = Date.now();

      if (this.useOpenRouter) {
        response = await this.callOpenRouter(messages, model, temperature, maxTokens);
      } else if (this.openai) {
        response = await this.callOpenAI(messages, model, temperature, maxTokens);
      } else {
        throw new Error('No AI service configured');
      }

      const processingTime = Date.now() - startTime;

      // Parse the AI response
      const content = response.choices[0].message.content;
      let parsedResponse;

      try {
        // Try to parse as JSON
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract code blocks
        parsedResponse = this.extractCodeFromText(content);
      }

      // Validate the response
      if (!parsedResponse.jsx) {
        throw new Error('AI response missing JSX code');
      }

      return {
        success: true,
        data: {
          jsx: parsedResponse.jsx,
          css: parsedResponse.css || '',
          componentName: parsedResponse.componentName || 'GeneratedComponent',
          description: parsedResponse.description || '',
          props: parsedResponse.props || {}
        },
        metadata: {
          model,
          tokens: response.usage?.total_tokens || 0,
          processingTime
        }
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate component'
      };
    }
  }

  async callOpenAI(messages, model, temperature, maxTokens) {
    return await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    });
  }

  async callOpenRouter(messages, model, temperature, maxTokens) {
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'Component Generator Platform'
        }
      }
    );

    return response.data;
  }

  extractCodeFromText(text) {
    // Fallback method to extract code from non-JSON responses
    const jsxMatch = text.match(/```(?:jsx?|tsx?)\n([\s\S]*?)```/);
    const cssMatch = text.match(/```css\n([\s\S]*?)```/);
    
    return {
      jsx: jsxMatch ? jsxMatch[1] : text,
      css: cssMatch ? cssMatch[1] : '',
      componentName: 'GeneratedComponent',
      description: 'Generated component',
      props: {}
    };
  }

  async refineComponent(currentComponent, refinementPrompt, options = {}) {
    const prompt = `Current component:

JSX:
${currentComponent.jsx}

CSS:
${currentComponent.css}

User refinement request: ${refinementPrompt}

Please modify the component according to the user's request. Return the updated component in the same JSON format.`;

    return this.generateComponent(prompt, options);
  }

  async generateFromImage(imageData, prompt, options = {}) {
    // For image-based generation, we'll enhance the prompt with image description
    const enhancedPrompt = `Based on the provided image and the following description: "${prompt}", create a React component that matches the design shown in the image.`;
    
    // Note: This is a simplified implementation
    // For full image support, you'd need to use vision models like GPT-4 Vision
    return this.generateComponent(enhancedPrompt, options);
  }
}

module.exports = new AIService();