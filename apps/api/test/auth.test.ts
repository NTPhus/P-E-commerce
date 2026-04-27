import { describe, it, expect } from 'vitest'
import { AuthService } from '../../src/auth/auth.service'

describe('AuthService (Phase 2)', () => {
  it('registers a user and logs in', () => {
    const s = new AuthService()
    const reg = s.register('alice', 'secret', 'alice@example.com')
    expect(reg).toHaveProperty('success', true)
    const login = s.login('alice', 'secret')
    expect(login).toHaveProperty('success', true)
    expect((login as any).token).toBeDefined()
  })
})
