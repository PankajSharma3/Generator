import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useSessionStore from '../stores/sessionStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const SessionPage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { currentSession, loadSession, isLoading } = useSessionStore()

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, loadSession])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Session not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

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
            <div>
              <h1 className="text-lg font-semibold text-white">{currentSession.name}</h1>
              {currentSession.description && (
                <p className="text-sm text-gray-400">{currentSession.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Chat History</h3>
          <div className="text-gray-400 text-center py-8">
            Chat interface will be implemented here
          </div>
        </div>

        {/* Component Preview Area */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Component Preview</h3>
              <div className="flex space-x-2">
                <button className="btn-outline">JSX</button>
                <button className="btn-outline">CSS</button>
                <button className="btn-primary">Export</button>
              </div>
            </div>
            
            <div className="flex-1 component-preview">
              <div className="text-gray-400 text-center">
                {currentSession.currentComponent ? (
                  <div>
                    <h4 className="text-white mb-2">{currentSession.currentComponent.name}</h4>
                    <p>Component preview will be rendered here</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-white mb-2">No component generated yet</h4>
                    <p>Start a conversation to generate your first component</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionPage