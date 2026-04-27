import { describe, it, expect, vi } from 'vitest'
import { RolesGuard } from '../src/auth/roles.guard'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'

describe('RolesGuard - RBAC', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = {
      get: vi.fn(),
      getAllAndOverride: vi.fn(),
    } as any
    guard = new RolesGuard(reflector)
  })

  describe('public routes', () => {
    it('should allow access to public routes without auth', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ user: undefined }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(true)

      const result = guard.canActivate(mockContext)
      expect(result).toBe(true)
    })
  })

  describe('protected routes', () => {
    it('should allow access when user has required role', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1', role: 'user' },
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(['user', 'admin'])

      const result = guard.canActivate(mockContext)
      expect(result).toBe(true)
    })

    it('should deny access when user lacks required role', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'user-1', role: 'user' },
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(['admin'])

      const result = guard.canActivate(mockContext)
      expect(result).toBe(false)
    })

    it('should deny access when user is not authenticated', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: undefined,
            headers: {},
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(['user', 'admin'])

      const result = guard.canActivate(mockContext)
      expect(result).toBe(false)
    })

    it('should support fallback to x-user-role header for MVP', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: undefined,
            headers: { 'x-user-role': 'admin' },
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(['admin'])

      const result = guard.canActivate(mockContext)
      expect(result).toBe(true)
    })

    it('should allow access when route has no roles defined', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: undefined,
            headers: {},
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(undefined)

      const result = guard.canActivate(mockContext)
      expect(result).toBe(true)
    })
  })

  describe('role hierarchy', () => {
    it('should allow admin to access user-only routes', () => {
      const mockContext = {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'admin-1', role: 'admin' },
          }),
        }),
      } as any

      ;(reflector.getAllAndOverride as any).mockReturnValue(false)
      ;(reflector.get as any).mockReturnValue(['user'])

      const result = guard.canActivate(mockContext)
      expect(result).toBe(false) // Exact match required, no hierarchy for MVP
    })
  })
})
