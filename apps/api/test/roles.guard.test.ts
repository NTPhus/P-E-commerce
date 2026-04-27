import { describe, it, expect } from 'vitest'
import { RolesGuard } from '../src/auth/roles.guard'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'

describe('RolesGuard (Phase 2 RBAC)', () => {
  it('allows when role matches metadata', async () => {
    const reflector = new Reflector()
    const guard = new RolesGuard(reflector as any)
    ;(guard as any).reflector.get = () => ['Admin']
    const ctx = {
      getHandler: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-user-role': 'Admin' } }) })
    } as unknown as ExecutionContext
    const res = await (guard as any).canActivate(ctx)
    expect(res).toBe(true)
  })

  it('denies when role not in allowed', async () => {
    const reflector = new Reflector()
    const guard = new RolesGuard(reflector as any)
    ;(guard as any).reflector.get = () => ['Admin']
    const ctx = {
      getHandler: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-user-role': 'Buyer' } }) })
    } as unknown as ExecutionContext
    const res = await (guard as any).canActivate(ctx)
    expect(res).toBe(false)
  })
})
