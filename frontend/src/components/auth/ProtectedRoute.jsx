import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute