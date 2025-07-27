const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Auth validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().trim().max(50).required().messages({
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().max(50).required().messages({
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Session validation schemas
const createSessionSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'string.max': 'Session name cannot exceed 100 characters',
    'any.required': 'Session name is required'
  }),
  description: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  })
});

const updateSessionSchema = Joi.object({
  name: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Session name cannot exceed 100 characters'
  }),
  description: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  settings: Joi.object({
    model: Joi.string().optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(1).max(4000).optional(),
    autoSave: Joi.boolean().optional()
  }).optional()
});

// Chat validation schemas
const chatMessageSchema = Joi.object({
  content: Joi.string().required().messages({
    'any.required': 'Message content is required'
  }),
  images: Joi.array().items(Joi.string()).optional()
});

// Component validation schemas
const componentUpdateSchema = Joi.object({
  jsx: Joi.string().required().messages({
    'any.required': 'JSX code is required'
  }),
  css: Joi.string().optional(),
  props: Joi.object().optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createSessionSchema,
  updateSessionSchema,
  chatMessageSchema,
  componentUpdateSchema
};