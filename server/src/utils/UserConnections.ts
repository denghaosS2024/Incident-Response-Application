/**
 * UserConnections Utility
 *
 * This utility manages the connections between users and their socket instances.
 * It provides methods to track user connections, add new connections, retrieve
 * connections, and manage the list of connected users.
 */

import SocketIO from 'socket.io'

// Map to store user connections, with user ID as key and socket as value
const connections = new Map<string, SocketIO.Socket>()

class UserConnections {
  /**
   * Check if a user is currently connected
   * @param uid - The user ID to check
   * @returns True if the user is connected, false otherwise
   */
  isUserConnected = (uid: string) => !!connections.get(uid)

  /**
   * Add a new user connection
   * @param uid - The user ID
   * @param connection - The socket connection for the user
   */
  addUserConnection = (uid: string, connection: SocketIO.Socket) =>
    connections.set(uid, connection)

  /**
   * Get the socket connection for a user
   * @param uid - The user ID
   * @returns The socket connection for the user, or undefined if not connected
   */
  getUserConnection = (uid: string) => connections.get(uid)

  /**
   * Remove a user connection
   * @param uid - The user ID
   * @returns True if the connection was removed, false if it didn't exist
   */
  removeUserConnection = (uid: string) => connections.delete(uid)

  /**
   * Get an array of all connected user IDs
   * @returns An array of user IDs for all currently connected users
   */
  getConnectedUsers = () => Array.from(connections.keys())

  /**
   * Broadcast an event to all connected users
   * @param eventName - The name of the event
   * @param data - The data to send with the event
   */
  broadcast(eventName: string, data: object|string = {}) {
    connections.forEach((socket) => {
      if (socket) {
        socket.emit(eventName, data); // Emit the event with data to each socket
      }
    });
  }
}

// Export a singleton instance of UserConnections
export default new UserConnections()
