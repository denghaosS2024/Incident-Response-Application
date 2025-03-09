/**
 * UserConnections Utility
 *
 * This utility manages the connections between users and their socket instances.
 * It provides methods to track user connections, add new connections, retrieve
 * connections, and manage the list of connected users.
 */

// Import the ROLES enum from the Roles utility
import { ROLES } from './Roles'
import SocketIO from 'socket.io'

// Map to store user connections, with user ID as key and socket as value
const connections = new Map<string, SocketIO.Socket>()

class UserConnections {
  private io: SocketIO.Server | null = null;

  constructor() {
  }

  // Add initialization method
  initializeIO(io: SocketIO.Server) {
    this.io = io;
  }

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
  addUserConnection = (uid: string, connection: SocketIO.Socket, role: ROLES) =>{
    connections.set(uid, connection);
    // Join role-based room
    connection.join(`role:${role}`);
    console.log(`User ${uid} connected with role ${role}`);
    // Add logging to verify room joining
    const rooms = connection.rooms;
    console.log('User connected:', {
      uid,
      role,
      rooms: Array.from(rooms || []),
      totalConnections: connections.size
    });
  }

  /**
   * Get the socket connection for a user
   * @param uid - The user ID
   * @returns The socket connection for the user, or undefined if not connected
   */
  getUserConnection = (uid: string) => connections.get(uid)

  /**
   * Remove a user connection and leave all rooms
   * @param uid - The user ID
   * @returns True if the connection was removed, false if it didn't exist
   */
  removeUserConnection = (uid: string) => {
    const socket = connections.get(uid)
    if (socket) {
      // Leave all rooms
      Object.values(ROLES).forEach(role => {
        socket.leave(`role:${role}`)
      })
    }

    return connections.delete(uid);
  }

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

  /**
   * Broadcast an event to all connected users with a specific role
   * @param role - The role to filter by
   * @param eventName - The name of the event
   * @param data - The data to send with the event
   */
  broadcaseToRole = (role: ROLES, eventName: string, data: object|string = {}) => {
    if (!this.io) {
      console.error('Socket.io server not initialized');
      return;
    }
    console.log(`Broadcasting to role: ${role}, event: ${eventName}, data:`, data);
    // Use server instance to broadcast to room
    this.io.to(`role:${role}`).emit(eventName, data);
  }
}

// Export a singleton instance of UserConnections
export default new UserConnections()
