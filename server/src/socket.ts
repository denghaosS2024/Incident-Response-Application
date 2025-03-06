/**
 * Socket.IO Setup
 *
 * This file sets up the WebSocket server using Socket.IO.
 * It handles user connections, authentication, and disconnections.
 */

import SocketIO from 'socket.io'

import * as Token from './utils/Token'
import UserConnections from './utils/UserConnections'
import { ROLES } from './utils/Roles';

interface ILoginMessage {
  token: string;
  uid: string;
  role: ROLES;
}

class Socket {
  /**
   * Set up Socket.IO server
   * @param server - The Socket.IO server instance
   */
  setup = (server: SocketIO.Server) => {
    server.on('connection', (socket: SocketIO.Socket) => {
      // Handle user login
      socket.on('login', (message: ILoginMessage) => {
        // Validate the user's token
        if (
          message.uid &&
          message.token &&
          message.role &&
          Token.validate(message.uid, message.token)
        ) {
          // Save the socket instance for the user
          UserConnections.addUserConnection(message.uid, socket, message.role)
          // Notify other users that this user's status has changed
          socket.broadcast.emit('user-status-changed', { uid: message.uid })
        } else {
          console.error(`Invalid login message from ${message.uid}`)
          socket.disconnect()
        }socket.broadcast.emit('user-status-changed', { uid: message.uid })
      })

      socket.on('send-mayday', (data) => {
        socket.broadcast.emit('send-mayday', data);
      });

      socket.on('acknowledge-alert', (data) => { 
        socket.broadcast.emit('acknowledge-alert', data);
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        const uid = UserConnections.getConnectedUsers().find(
          (uid) => UserConnections.getUserConnection(uid) === socket,
        )

        if (uid) {
          UserConnections.removeUserConnection(uid)
          // Notify other users that this user's status has changed
          socket.broadcast.emit('user-status-changed', { uid })
        }
      })
    })
  }
}

export default new Socket()
