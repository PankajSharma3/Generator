import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LogOut, 
  User, 
  Calendar,
  Clock,
  Code,
  Trash2,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useSessionStore from '../stores/sessionStore';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    sessions, 
    isLoading, 
    fetchSessions, 
    createSession, 
    deleteSession,
    clearSession 
  } = useSessionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchSessions();
    clearSession(); // Clear any existing session when entering dashboard
  }, [fetchSessions, clearSession]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionData.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }

    try {
      const response = await createSession(newSessionData);
      const sessionId = response.data.session._id;
      toast.success('Session created successfully!');
      setShowCreateModal(false);
      setNewSessionData({ title: '', description: '' });
      navigate(`/workspace/${sessionId}`);
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const handleDeleteSession = async (sessionId, sessionTitle) => {
    if (window.confirm(`Are you sure you want to delete "${sessionTitle}"?`)) {
      try {
        await deleteSession(sessionId);
        toast.success('Session deleted successfully');
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Component Generator
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">{user?.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Create and manage your React component generation sessions.
          </p>
        </motion.div>

        {/* Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </motion.button>
        </motion.div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading sessions..." />
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No sessions found' : 'No sessions yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first session to start generating components'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First Session
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-medium transition-shadow cursor-pointer group"
                onClick={() => navigate(`/workspace/${session._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {session.title}
                  </h3>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add edit functionality here
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session._id, session.title);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {session.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {session.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(session.lastAccessed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Session
            </h3>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter session title"
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData({
                    ...newSessionData,
                    title: e.target.value
                  })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Enter session description"
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData({
                    ...newSessionData,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Session
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;