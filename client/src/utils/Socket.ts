import { Socket, io } from 'socket.io-client'
import Globals from './Globals'
import { ROLES, isValidRole } from './Roles'
/**
 * SocketClient Class
 *
 * This class manages a single Socket.io connection across the application.
 */
class SocketClient {
  private socket?: Socket

  /**
   * Establishes a connection to the Socket.io server
   */
  connect = () => {
    const uid = localStorage.getItem('uid')
    const token = localStorage.getItem('token')
    const roleFromStorage = localStorage.getItem('role')

    if (!roleFromStorage || !isValidRole(roleFromStorage)) {
      console.error('Invalid role:', roleFromStorage)
      return
    }

    const role = roleFromStorage as ROLES

    if (this.socket || !uid || !token || !Object.values(ROLES).includes(role)) {
      return
    }

    const url = Globals.backendUrl()
    this.socket = io(url)

    // Authenticate the socket connection
    this.socket.emit('login', {
      token,
      uid,
      role,
    })
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
      // console.log('Listening:', eventName);
      this.socket.on(eventName, listener)
    }
  }

  off(eventName: string) {
    if (this.socket) {
      this.socket.off(eventName)
    }
  }

  // TODO: Whoever wrote this "any", please fix it when you figure out what type it should be
  emit(eventName: string, data: any) {
    if (this.socket) {
      // console.log('Emitting:', eventName, data);
      this.socket.emit(eventName, data)
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
