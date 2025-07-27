import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import sessionService from '../services/sessionService';
import aiService from '../services/aiService';

const useSessionStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    sessions: [],
    currentSession: null,
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
    },
    isLoading: false,
    isGenerating: false,
    error: null,
    
    // Pagination state
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },

    // Actions
    fetchSessions: async (page = 1, search = '') => {
      set({ isLoading: true, error: null });
      try {
        const response = await sessionService.getSessions({ page, search });
        const { sessions, pagination } = response.data;
        
        set({
          sessions,
          pagination,
          isLoading: false,
          error: null
        });
        
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch sessions';
        set({
          sessions: [],
          isLoading: false,
          error: errorMessage
        });
        throw error;
      }
    },

    createSession: async (sessionData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await sessionService.createSession(sessionData);
        const session = response.data.session;
        
        set(state => ({
          sessions: [session, ...state.sessions],
          isLoading: false,
          error: null
        }));
        
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to create session';
        set({
          isLoading: false,
          error: errorMessage
        });
        throw error;
      }
    },

    loadSession: async (sessionId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await sessionService.getSession(sessionId);
        const session = response.data.session;
        
        set({
          currentSession: session,
          chatHistory: session.chatHistory || [],
          currentCode: session.currentCode || { jsx: '', css: '', typescript: false },
          uiState: session.uiState || { 
            selectedElement: null, 
            propertyPanelOpen: false, 
            activeTab: 'preview', 
            zoom: 1 
          },
          isLoading: false,
          error: null
        });
        
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to load session';
        set({
          currentSession: null,
          chatHistory: [],
          currentCode: { jsx: '', css: '', typescript: false },
          uiState: { selectedElement: null, propertyPanelOpen: false, activeTab: 'preview', zoom: 1 },
          isLoading: false,
          error: errorMessage
        });
        throw error;
      }
    },

    updateSession: async (sessionId, updates) => {
      try {
        const response = await sessionService.updateSession(sessionId, updates);
        const updatedSession = response.data.session;
        
        set(state => ({
          sessions: state.sessions.map(s => s._id === sessionId ? updatedSession : s),
          currentSession: state.currentSession?._id === sessionId ? updatedSession : state.currentSession
        }));
        
        return response;
      } catch (error) {
        throw error;
      }
    },

    deleteSession: async (sessionId) => {
      try {
        await sessionService.deleteSession(sessionId);
        
        set(state => ({
          sessions: state.sessions.filter(s => s._id !== sessionId),
          currentSession: state.currentSession?._id === sessionId ? null : state.currentSession
        }));
      } catch (error) {
        throw error;
      }
    },

    generateComponent: async (prompt, images = []) => {
      const { currentSession } = get();
      if (!currentSession) {
        throw new Error('No active session');
      }

      set({ isGenerating: true, error: null });
      
      try {
        const response = await aiService.generateComponent({
          sessionId: currentSession._id,
          prompt,
          images
        });
        
        const { code, chatMessage } = response.data;
        
        set(state => ({
          currentCode: code,
          chatHistory: [...state.chatHistory, {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: new Date(),
            images
          }, chatMessage],
          isGenerating: false,
          error: null
        }));
        
        // Auto-save the session
        await get().autoSave();
        
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to generate component';
        set({
          isGenerating: false,
          error: errorMessage
        });
        throw error;
      }
    },

    refineComponent: async (prompt, targetElement = null) => {
      const { currentSession } = get();
      if (!currentSession) {
        throw new Error('No active session');
      }

      set({ isGenerating: true, error: null });
      
      try {
        const response = await aiService.refineComponent({
          sessionId: currentSession._id,
          prompt,
          targetElement
        });
        
        const { code, chatMessage } = response.data;
        
        set(state => ({
          currentCode: code,
          chatHistory: [...state.chatHistory, {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: new Date()
          }, chatMessage],
          isGenerating: false,
          error: null
        }));
        
        // Auto-save the session
        await get().autoSave();
        
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to refine component';
        set({
          isGenerating: false,
          error: errorMessage
        });
        throw error;
      }
    },

    updateCode: async (codeUpdates) => {
      const { currentSession } = get();
      if (!currentSession) return;

      try {
        const newCode = { ...get().currentCode, ...codeUpdates };
        
        await sessionService.updateCode(currentSession._id, newCode);
        
        set({ currentCode: newCode });
      } catch (error) {
        console.error('Failed to update code:', error);
      }
    },

    updateUIState: async (uiUpdates) => {
      const { currentSession } = get();
      if (!currentSession) return;

      try {
        const newUIState = { ...get().uiState, ...uiUpdates };
        
        await sessionService.updateUIState(currentSession._id, newUIState);
        
        set({ uiState: newUIState });
      } catch (error) {
        console.error('Failed to update UI state:', error);
      }
    },

    // Auto-save session data
    autoSave: async () => {
      const { currentSession, chatHistory, currentCode, uiState } = get();
      if (!currentSession) return;

      try {
        // Update chat history
        if (chatHistory.length > 0) {
          const lastMessage = chatHistory[chatHistory.length - 1];
          await sessionService.addChatMessage(currentSession._id, lastMessage);
        }
        
        // Update code
        await sessionService.updateCode(currentSession._id, currentCode);
        
        // Update UI state
        await sessionService.updateUIState(currentSession._id, uiState);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },

    // Clear current session
    clearSession: () => {
      set({
        currentSession: null,
        chatHistory: [],
        currentCode: { jsx: '', css: '', typescript: false },
        uiState: { selectedElement: null, propertyPanelOpen: false, activeTab: 'preview', zoom: 1 }
      });
    },

    // Clear error
    clearError: () => set({ error: null })
  }))
);

// Auto-save when certain state changes
let autoSaveTimeout;
useSessionStore.subscribe(
  (state) => ({
    currentCode: state.currentCode,
    uiState: state.uiState
  }),
  () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      useSessionStore.getState().autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }
);

export default useSessionStore;