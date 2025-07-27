import { apiMethods } from './api';

const aiService = {
  // Generate component from prompt
  generateComponent: async (data) => {
    return apiMethods.post('/ai/generate', data);
  },

  // Refine existing component
  refineComponent: async (data) => {
    return apiMethods.post('/ai/refine', data);
  },

  // Get available AI models
  getModels: async () => {
    return apiMethods.get('/ai/models');
  }
};

export default aiService;