import { Controller, Get, Query, Post, Body } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Message } from './model'

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/rooms/:roomId/messages')
  getMessages(@Query('roomId') roomId: string): Message[] {
    // In actual route, roomId comes from URL param; keeping query for simplicity in MVP
    return this.chatService.listMessages(roomId)
  }

  // MVP: minimal metrics endpoints (mock)
  @Get('/metrics/throughput')
  getThroughput(): any {
    return { throughput: 12 } // mock value
  }

  @Get('/metrics/latency')
  getLatency(): any {
    return { latencyMs: 120 }
  }

  @Get('/agents/status')
  getAgentStatus(): any {
    return { CatalogAgent: 'idle', CartAgent: 'idle', CheckoutAgent: 'idle' }
  }

  @Post('/planner/plan')
  planTask(@Body() payload: any): any {
    // Very lightweight stub: assign agent based on action
    const action = payload?.action
    const agent = (action === 'create_product') ? 'CatalogAgent' : (action === 'add_to_cart' ? 'CartAgent' : 'CatalogAgent')
    const task = { id: payload?.taskId ?? 'T0.999', action, assignedAgent: agent, data: payload?.data }
    return { success: true, task }
  }
}
