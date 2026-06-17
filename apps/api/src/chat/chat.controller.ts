import { Controller, Get, Query } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Message } from './model'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/rooms/:roomId/messages')
  getMessages(@Query('roomId') roomId: string): Message[] {
    // In actual route, roomId comes from URL param; keeping query for simplicity in MVP
    return this.chatService.listMessages(roomId)
  }
}
