import { Socket, io } from 'socket.io-client'

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

    if (this.socket || !uid || !token) {
      return
    }

    const url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'
    this.socket = io(url)

    // Authenticate the socket connection
    this.socket.emit('login', {
      token,
      uid,
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
      this.socket.off(eventName);
    }
  }

  emit(eventName: string, data: any) {
    if (this.socket) {
      // console.log('Emitting:', eventName, data);
      this.socket.emit(eventName, data);
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
