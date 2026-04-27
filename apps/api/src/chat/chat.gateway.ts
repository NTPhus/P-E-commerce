import { WebSocketGateway, WebSocketServer, MessageBody, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    // init
  }

  handleConnection(client: Socket) {
    // client connected
  }

  handleDisconnect(client: Socket) {
    // client disconnected
  }

  @SubscribeMessage('send_message')
  handleMessage(client: any, payload: { roomId: string; senderId: string; text: string }) {
    const msg = this.chatService.addMessage(payload.roomId, payload.senderId, payload.text)
    this.server.to(payload.roomId).emit('new_message', msg)
    return { ok: true, messageId: msg.id }
  }
}
