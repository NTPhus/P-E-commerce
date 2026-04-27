import { Message } from './model'

type RoomMessages = Map<string, Message[]>

export class ChatService {
  private messages: RoomMessages = new Map()

  listMessages(roomId: string): Message[] {
    return this.messages.get(roomId) || []
  }

  addMessage(roomId: string, senderId: string, text: string): Message {
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      roomId,
      senderId,
      text,
      timestamp: Date.now()
    }
    const arr = this.messages.get(roomId) || []
    arr.push(msg)
    this.messages.set(roomId, arr)
    return msg
  }
}
