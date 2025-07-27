import { apiMethods } from './api';

const sessionService = {
  // Get all user sessions
  getSessions: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiMethods.get(`/sessions?${queryParams}`);
  },

  // Get a specific session
  getSession: async (sessionId) => {
    return apiMethods.get(`/sessions/${sessionId}`);
  },

  // Create a new session
  createSession: async (sessionData) => {
    return apiMethods.post('/sessions', sessionData);
  },

  // Update session metadata
  updateSession: async (sessionId, updates) => {
    return apiMethods.put(`/sessions/${sessionId}`, updates);
  },

  // Delete session
  deleteSession: async (sessionId) => {
    return apiMethods.delete(`/sessions/${sessionId}`);
  },

  // Add chat message to session
  addChatMessage: async (sessionId, message) => {
    return apiMethods.post(`/sessions/${sessionId}/chat`, message);
  },

  // Update session code
  updateCode: async (sessionId, code) => {
    return apiMethods.put(`/sessions/${sessionId}/code`, code);
  },

  // Update session UI state
  updateUIState: async (sessionId, uiState) => {
    return apiMethods.put(`/sessions/${sessionId}/ui-state`, uiState);
  }
};

export default sessionService;