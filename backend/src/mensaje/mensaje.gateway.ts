// backend/src/mensaje/mensaje.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MensajeService } from './mensaje.service';

type AuthedSocket = Socket & { userId?: number };

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'https://ecosysval-app.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
  namespace: '/chat',
})
export class MensajeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly mensajeService: MensajeService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload?.sub || payload?.id;

      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = Number(userId);

      if (!this.onlineUsers.has(client.userId)) {
        this.onlineUsers.set(client.userId, new Set());
      }
      this.onlineUsers.get(client.userId)!.add(client.id);

      // Room personal del usuario para pushes directos
      client.join(`user:${client.userId}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (!client.userId) return;
    const set = this.onlineUsers.get(client.userId);
    if (set) {
      set.delete(client.id);
      if (set.size === 0) this.onlineUsers.delete(client.userId);
    }
  }

  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversacionId: number },
  ) {
    if (!client.userId || !data?.conversacionId) return { ok: false };
    try {
      await this.mensajeService.obtenerConversacion(data.conversacionId, client.userId);
      client.join(`conv:${data.conversacionId}`);
      return { ok: true, conversacionId: data.conversacionId };
    } catch {
      return { ok: false, error: 'Sin acceso a la conversación' };
    }
  }

  @SubscribeMessage('leave_conversation')
  leaveConversation(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversacionId: number },
  ) {
    if (data?.conversacionId) client.leave(`conv:${data.conversacionId}`);
    return { ok: true };
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversacionId: number; contenido: string },
  ) {
    if (!client.userId) return { ok: false, error: 'No autenticado' };
    if (!data?.conversacionId || !data?.contenido?.trim()) {
      return { ok: false, error: 'Datos inválidos' };
    }

    try {
      const mensaje = await this.mensajeService.enviarMensaje(
        data.conversacionId,
        client.userId,
        data.contenido,
      );

      this.emitirNuevoMensaje(mensaje, data.conversacionId);
      return { ok: true, mensaje };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Error enviando mensaje' };
    }
  }

  @SubscribeMessage('typing')
  async typing(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversacionId: number; isTyping: boolean },
  ) {
    if (!client.userId || !data?.conversacionId) return;
    client.to(`conv:${data.conversacionId}`).emit('user_typing', {
      conversacionId: data.conversacionId,
      userId: client.userId,
      isTyping: !!data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async markRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { conversacionId: number },
  ) {
    if (!client.userId || !data?.conversacionId) return { ok: false };
    const result = await this.mensajeService.marcarLeidos(
      data.conversacionId,
      client.userId,
    );
    this.emitirLeidos(data.conversacionId, client.userId, result.marcados);
    return result;
  }

  // Métodos auxiliares para emitir eventos
  emitirNuevoMensaje(mensaje: any, conversacionId: number) {
    this.server.to(`conv:${conversacionId}`).emit('new_message', {
      conversacionId,
      mensaje,
    });
    this.server.emit('inbox_updated', { conversacionId, mensaje });
  }

  emitirLeidos(conversacionId: number, readerId: number, marcados: number) {
    this.server.to(`conv:${conversacionId}`).emit('messages_read', {
      conversacionId,
      readerId,
      marcados,
    });
  }
}