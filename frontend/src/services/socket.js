import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect() {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts')
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  joinSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-session', sessionId)
      console.log('Joined session:', sessionId)
    }
  }

  leaveSession(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-session', sessionId)
      console.log('Left session:', sessionId)
    }
  }

  // Listen for events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event)
      this.listeners.delete(event)
    }
  }

  // Clean up all listeners
  cleanup() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        this.socket.removeAllListeners(event)
      })
      this.listeners.clear()
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  // Check connection status
  getConnectionStatus() {
    return this.isConnected
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService