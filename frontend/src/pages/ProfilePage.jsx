import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Lock } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateProfile, changePassword, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost p-2 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">Profile Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'security'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <ProfileTab user={user} updateProfile={updateProfile} isLoading={isLoading} />
            )}
            {activeTab === 'security' && (
              <SecurityTab changePassword={changePassword} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Tab Component
const ProfileTab = ({ user, updateProfile, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName
    })
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="email"
              value={formData.email}
              className="input pl-10 opacity-50 cursor-not-allowed"
              disabled
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Email address cannot be changed</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Updating...
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Security Tab Component
const SecurityTab = ({ changePassword, isLoading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const result = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    })

    if (result.success) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`input pl-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`input pl-10 ${errors.newPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Changing...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage