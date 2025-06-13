// src/notification/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  namespace: "sockets/notifications",
  cors: { origin: "*" },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private clients = new Map<string, Socket>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    try {
      const { sub: userId } = this.jwtService.verify<{ sub: string }>(token, {
        secret: process.env.JWT_SECRET,
      });
      this.clients.set(userId, client);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sock] of this.clients.entries()) {
      if (sock.id === client.id) this.clients.delete(userId);
    }
  }

  /** 호출 시 특정 사용자에게 푸시 */
  sendToUser(userId: string, payload: any) {
    const client = this.clients.get(userId);
    if (client) client.emit("newNotification", payload);
  }
}
