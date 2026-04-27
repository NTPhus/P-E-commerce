import { describe, it, expect, beforeEach } from 'vitest'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '../auth/auth.service'

describe('AuthService - JWT', () => {
  let authService: AuthService
  let jwtService: JwtService

  beforeEach(() => {
    // Mock JWT service
    jwtService = {
      sign: (payload: any) => {
        return 'jwt-token-' + JSON.stringify(payload)
      },
    } as any

    authService = new AuthService(jwtService)
  })

  describe('register', () => {
    it('should register a new user and return JWT token', () => {
      const result = authService.register('testuser', 'password123', 'test@example.com')

      expect(result.success).toBe(true)
      expect(result.token).toBeDefined()
      expect(result.user?.username).toBe('testuser')
      expect(result.user?.email).toBe('test@example.com')
      expect(result.user?.role).toBe('user')
    })

    it('should fail if user already exists', () => {
      authService.register('testuser', 'password123', 'test@example.com')
      const result = authService.register('testuser', 'password456', 'test2@example.com')

      expect(result.success).toBe(false)
      expect(result.message).toBe('User already exists')
    })

    it('should not include password in response', () => {
      const result = authService.register('testuser', 'password123', 'test@example.com')

      expect(result.user).not.toHaveProperty('password')
    })
  })

  describe('login', () => {
    beforeEach(() => {
      authService.register('testuser', 'password123', 'test@example.com')
    })

    it('should login user with correct credentials and return JWT token', () => {
      const result = authService.login('testuser', 'password123')

      expect(result.success).toBe(true)
      expect(result.token).toBeDefined()
      expect(result.user?.username).toBe('testuser')
    })

    it('should fail with incorrect password', () => {
      const result = authService.login('testuser', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid credentials')
    })

    it('should fail with non-existent user', () => {
      const result = authService.login('nonexistent', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid credentials')
    })
  })

  describe('validateUser', () => {
    beforeEach(() => {
      authService.register('testuser', 'password123', 'test@example.com')
    })

    it('should return user by id', () => {
      const result = authService.register('testuser', 'password123', 'test@example.com')
      const userId = result.user?.id

      const user = authService.validateUser(userId!)
      expect(user).toBeDefined()
      expect(user?.username).toBe('testuser')
    })

    it('should return null for non-existent user', () => {
      const user = authService.validateUser('non-existent-id')
      expect(user).toBeNull()
    })
  })
})
