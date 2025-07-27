import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import socketService from './services/socket'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SessionPage from './pages/SessionPage'
import ProfilePage from './pages/ProfilePage'

// Components
import LoadingSpinner from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { isAuthenticated, initializeAuth, user } = useAuthStore()
  const [isInitializing, setIsInitializing] = React.useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [initializeAuth])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io when authenticated
      socketService.connect()
    } else {
      // Disconnect when not authenticated
      socketService.disconnect()
    }

    // Cleanup on unmount
    return () => {
      socketService.cleanup()
    }
  }, [isAuthenticated, user])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } 
        />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/session/:sessionId" element={
          <ProtectedRoute>
            <SessionPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
        
        {/* Catch all - redirect to dashboard or login */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  )
}

export default App