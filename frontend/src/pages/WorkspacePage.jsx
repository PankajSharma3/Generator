import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';
import LoadingSpinner from '../components/LoadingSpinner';

const WorkspacePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentSession, isLoading, loadSession } = useSessionStore();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading workspace..." />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session not found</h3>
          <p className="text-gray-500 mb-6">The session you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900">
                {currentSession.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Code className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workspace Coming Soon!</h2>
          <p className="text-gray-600 mb-6">
            The full component generation workspace with chat interface, code editor, 
            and live preview will be implemented here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">Current Session:</h3>
            <p className="text-blue-700 text-sm">{currentSession.title}</p>
            {currentSession.description && (
              <p className="text-blue-600 text-xs mt-1">{currentSession.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;