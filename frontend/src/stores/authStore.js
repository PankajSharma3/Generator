import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data.data

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          })

          // Remove token from requests
          delete api.defaults.headers.common['Authorization']
          
          toast.success('Logged out successfully')
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          const response = await api.put('/auth/profile', profileData)
          const { user } = response.data.data

          set({
            user,
            isLoading: false
          })

          toast.success('Profile updated successfully!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true })
        try {
          await api.post('/auth/change-password', passwordData)
          set({ isLoading: false })
          
          toast.success('Password changed successfully!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Password change failed'
          toast.error(message)
          return { success: false, message }
        }
      },

      // Initialize auth from stored token
      initializeAuth: async () => {
        const { token } = get()
        if (token) {
          try {
            // Set token for requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            // Verify token and get user data
            const response = await api.get('/auth/me')
            const { user } = response.data.data

            set({
              user,
              isAuthenticated: true
            })
          } catch (error) {
            // Token is invalid, clear auth state
            set({
              user: null,
              token: null,
              isAuthenticated: false
            })
            delete api.defaults.headers.common['Authorization']
          }
        }
      },

      // Clear auth state (used for logout or token expiry)
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        delete api.defaults.headers.common['Authorization']
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

export default useAuthStore