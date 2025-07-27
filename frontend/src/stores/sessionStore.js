import { create } from 'zustand'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const useSessionStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  currentComponent: null,
  chatHistory: [],
  isLoading: false,
  isGenerating: false,

  // Actions
  fetchSessions: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/sessions')
      const { sessions } = response.data.data
      
      set({ 
        sessions,
        isLoading: false 
      })
      
      return { success: true, sessions }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Failed to fetch sessions'
      toast.error(message)
      return { success: false, message }
    }
  },

  fetchRecentSessions: async () => {
    try {
      const response = await api.get('/sessions/recent')
      const { sessions } = response.data.data
      
      return { success: true, sessions }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch recent sessions'
      console.error(message)
      return { success: false, message }
    }
  },

  createSession: async (sessionData) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/sessions', sessionData)
      const { session } = response.data.data

      // Add to sessions list
      set((state) => ({
        sessions: [session, ...state.sessions],
        isLoading: false
      }))

      toast.success('Session created successfully!')
      return { success: true, session }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Failed to create session'
      toast.error(message)
      return { success: false, message }
    }
  },

  loadSession: async (sessionId) => {
    set({ isLoading: true })
    try {
      const response = await api.get(`/sessions/${sessionId}`)
      const { session } = response.data.data

      set({
        currentSession: session,
        currentComponent: session.currentComponent,
        chatHistory: session.chatHistory || [],
        isLoading: false
      })

      return { success: true, session }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Failed to load session'
      toast.error(message)
      return { success: false, message }
    }
  },

  updateSession: async (sessionId, updateData) => {
    try {
      const response = await api.put(`/sessions/${sessionId}`, updateData)
      const { session } = response.data.data

      // Update current session if it's the one being updated
      set((state) => ({
        currentSession: state.currentSession?.id === sessionId ? session : state.currentSession,
        sessions: state.sessions.map(s => s._id === sessionId ? session : s)
      }))

      toast.success('Session updated successfully!')
      return { success: true, session }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update session'
      toast.error(message)
      return { success: false, message }
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`)

      // Remove from sessions list
      set((state) => ({
        sessions: state.sessions.filter(s => s._id !== sessionId),
        currentSession: state.currentSession?._id === sessionId ? null : state.currentSession
      }))

      toast.success('Session deleted successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete session'
      toast.error(message)
      return { success: false, message }
    }
  },

  duplicateSession: async (sessionId) => {
    set({ isLoading: true })
    try {
      const response = await api.post(`/sessions/${sessionId}/duplicate`)
      const { session } = response.data.data

      // Add to sessions list
      set((state) => ({
        sessions: [session, ...state.sessions],
        isLoading: false
      }))

      toast.success('Session duplicated successfully!')
      return { success: true, session }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Failed to duplicate session'
      toast.error(message)
      return { success: false, message }
    }
  },

  sendMessage: async (message, images = []) => {
    const { currentSession } = get()
    if (!currentSession) {
      toast.error('No active session')
      return { success: false, message: 'No active session' }
    }

    set({ isGenerating: true })
    
    // Add user message to chat history immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { images }
    }

    set((state) => ({
      chatHistory: [...state.chatHistory, userMessage]
    }))

    try {
      const response = await api.post(`/ai/chat/${currentSession._id}`, {
        content: message,
        images
      })

      const { message: assistantMessage, component, session } = response.data.data

      // Update chat history and component
      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMessage],
        currentComponent: component,
        currentSession: { ...state.currentSession, ...session },
        isGenerating: false
      }))

      return { success: true, component, message: assistantMessage }
    } catch (error) {
      set({ isGenerating: false })
      const errorMessage = error.response?.data?.message || 'Failed to send message'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  },

  refineComponent: async (refinementMessage) => {
    const { currentSession } = get()
    if (!currentSession) {
      toast.error('No active session')
      return { success: false, message: 'No active session' }
    }

    set({ isGenerating: true })

    // Add user message to chat history
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Refine: ${refinementMessage}`,
      timestamp: new Date()
    }

    set((state) => ({
      chatHistory: [...state.chatHistory, userMessage]
    }))

    try {
      const response = await api.post(`/ai/refine/${currentSession._id}`, {
        content: refinementMessage
      })

      const { message: assistantMessage, component, session } = response.data.data

      // Update chat history and component
      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMessage],
        currentComponent: component,
        currentSession: { ...state.currentSession, ...session },
        isGenerating: false
      }))

      return { success: true, component, message: assistantMessage }
    } catch (error) {
      set({ isGenerating: false })
      const errorMessage = error.response?.data?.message || 'Failed to refine component'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  },

  regenerateComponent: async () => {
    const { currentSession } = get()
    if (!currentSession) {
      toast.error('No active session')
      return { success: false, message: 'No active session' }
    }

    set({ isGenerating: true })

    try {
      const response = await api.post(`/ai/regenerate/${currentSession._id}`)
      const { message: assistantMessage, component, session } = response.data.data

      // Update chat history and component
      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMessage],
        currentComponent: component,
        currentSession: { ...state.currentSession, ...session },
        isGenerating: false
      }))

      return { success: true, component, message: assistantMessage }
    } catch (error) {
      set({ isGenerating: false })
      const errorMessage = error.response?.data?.message || 'Failed to regenerate component'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  },

  exportComponent: async (format = 'zip') => {
    const { currentSession } = get()
    if (!currentSession) {
      toast.error('No active session')
      return { success: false, message: 'No active session' }
    }

    try {
      const response = await api.get(`/export/component/${currentSession._id}`, {
        responseType: 'blob'
      })

      // Create download link
      const blob = new Blob([response.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentSession.currentComponent?.name || 'component'}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Component exported successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to export component'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  },

  getComponentCode: async () => {
    const { currentSession } = get()
    if (!currentSession) {
      return { success: false, message: 'No active session' }
    }

    try {
      const response = await api.get(`/export/code/${currentSession._id}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get component code'
      return { success: false, message: errorMessage }
    }
  },

  // Clear current session
  clearCurrentSession: () => {
    set({
      currentSession: null,
      currentComponent: null,
      chatHistory: []
    })
  },

  // Add message to chat history (for real-time updates)
  addMessage: (message) => {
    set((state) => ({
      chatHistory: [...state.chatHistory, message]
    }))
  },

  // Update component (for real-time updates)
  updateComponent: (component) => {
    set({
      currentComponent: component
    })
  }
}))

export default useSessionStore