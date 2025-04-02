import { Socket, io } from 'socket.io-client'
import Globals from './Globals'
import { ROLES, isValidRole } from './Roles'
/**
 * SocketClient Class
 *
 * This class manages a single Socket.io connection across the application.
 */
class SocketClient {
  private socket: Socket | undefined = undefined

  /**
   * Establishes a connection to the Socket.io server
   */
  connect = (): Socket | undefined => {
    const uid = localStorage.getItem('uid')
    const token = localStorage.getItem('token')
    const roleFromStorage = localStorage.getItem('role')

    if (!roleFromStorage || !isValidRole(roleFromStorage)) {
      console.error('Invalid role:', roleFromStorage)
      return undefined
    }

    const role = roleFromStorage as ROLES

    if (this.socket || !uid || !token || !Object.values(ROLES).includes(role)) {
      return this.socket
    }

    const url = Globals.backendUrl()
    console.log('Connecting to socket at:', url)
    this.socket = io(url)

    // Authenticate the socket connection
    this.socket.emit('login', {
      token,
      uid,
      role,
    })

    // Set up basic event listeners for debugging
    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket?.id)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    return this.socket
  }

  /**
   * Registers an event listener on the socket
   *
   * @param eventName - The name of the event to listen for
   * @param listener - The callback function to execute when the event is received
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(eventName: string, listener: (...args: any[]) => void) {
    if (this.socket) {
      console.debug('Adding listener for event:', eventName)
      this.socket.on(eventName, (data) => {
        console.log(`Received ${eventName} event:`, data)
        listener(data)
      })
    } else {
      console.warn('Attempted to add listener but socket is not connected')
      const socket = this.connect() // Try to connect first
      if (socket) {
        socket.on(eventName, listener)
      }
    }
  }

  off(eventName: string) {
    if (this.socket) {
      console.log('Removing listener for event:', eventName)
      this.socket.off(eventName)
    }
  }

  // TODO: Whoever wrote this "any", please fix it when you figure out what type it should be
  emit(eventName: string, data: unknown) {
    if (this.socket) {
      console.log('Emitting event:', eventName, data)
      this.socket.emit(eventName, data)
    } else {
      console.warn('Attempted to emit but socket is not connected')
      const socket = this.connect() // Try to connect first
      if (socket) {
        socket.emit(eventName, data)
      }
    }
  }

  /**
   * Closes the socket connection
   */
  close = () => {
    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }
}

// Export a singleton instance of SocketClient
export default new SocketClient()
