import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles || roles.length === 0) return true
    // Simple mock: read role from headers for MVP
    const req = context.switchToHttp().getRequest()
    const userRole = req.headers['x-user-role'] as string
    return !!userRole && roles.includes(userRole)
  }
}
