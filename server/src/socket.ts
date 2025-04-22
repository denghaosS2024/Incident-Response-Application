/**
 * Socket.IO Setup
 *
 * This file sets up the WebSocket server using Socket.IO.
 * It handles user connections, authentication, and disconnections.
 */

import SocketIO from "socket.io";

import UserController from "./controllers/UserController";
import { ROLES } from "./utils/Roles";
import * as Token from "./utils/Token";
import UserConnections from "./utils/UserConnections";

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
    UserConnections.initializeIO(server);

    server.on("connection", (socket: SocketIO.Socket) => {
      // Handle user login
      socket.on("login", async (message: ILoginMessage) => {
        // Validate the user's token
        if (
          message.uid &&
          message.token &&
          message.role &&
          Token.validate(message.uid, message.token)
        ) {
          // Save the socket instance for the user
          UserConnections.addUserConnection(message.uid, socket, message.role);

          // If the user is a Nurse, join their hospital room
          if (message.role === ROLES.NURSE) {
            const user = await UserController.getUserById(message.uid); // Fetch user details
            if (user && user.hospitalId) {
              UserConnections.joinHospitalRoom(message.uid, user.hospitalId);
            } else {
              console.warn(
                `Nurse ${message.uid} does not have a hospitalId associated.`,
              );
            }
          }

          // Notify other users that this user's status has changed
          socket.broadcast.emit("user-status-changed", { uid: message.uid });
        } else {
          console.error(`Invalid login message from ${message.uid}`);
          socket.disconnect();
        }
        socket.broadcast.emit("user-status-changed", { uid: message.uid });
      });

      socket.on("send-mayday", (data) => {
        socket.broadcast.emit("send-mayday", data);
      });

      // Handle nurse alerts specifically to make sure they get broadcasted correctly
      socket.on("nurse-alert", (data) => {
        console.log("Received nurse-alert", data);
        // Broadcast to all connected sockets except sender
        socket.broadcast.emit("nurse-alert", data);
      });

      socket.on("acknowledge-alert", (data) => {
        socket.broadcast.emit("acknowledge-alert", data);
      });

      socket.on("group-member-added", (data) => {
        socket.broadcast.emit("group-member-added", data);
      });

      socket.on("map-area-update", (data) => {
        socket.broadcast.emit("map-area-update", data);
      });

      socket.on("map-area-delete", (data) => {
        socket.broadcast.emit("map-area-delete", data);
      });

      socket.on("patientUpdated", (data) => {
        console.log("Patient updated", data);
        socket.broadcast.emit("patientUpdated", data);
      });

      socket.on("funding-assigned", (data) => {
        socket.broadcast.emit("funding-assigned", data);
      });

      // Handle user disconnection
      socket.on("disconnect", () => {
        const uid = UserConnections.getConnectedUsers().find(
          (uid) => UserConnections.getUserConnection(uid) === socket,
        );

        if (uid) {
          UserConnections.removeUserConnection(uid);
          // Notify other users that this user's status has changed
          socket.broadcast.emit("user-status-changed", { uid });
        }
      });
    });
  };
}

export default new Socket();
