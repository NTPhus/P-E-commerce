import { describe, it, expect } from 'vitest'
import { ChatService } from '../src/chat/chat.service'
import { Message } from '../src/chat/model'

describe('ChatService MVP', () => {
  it('adds and lists messages per room', () => {
    const svc = new ChatService()
    const msg: Message = svc.addMessage('room1', 'u1', 'hello')
    expect(msg).toHaveProperty('id')
    const list = svc.listMessages('room1')
    expect(list.length).toBe(1)
    expect(list[0].text).toBe('hello')
  })
})
