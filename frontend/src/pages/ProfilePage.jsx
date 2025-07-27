import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div className="h-px w-4 bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;