import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser & { headers?: Record<string, string> }>();
    const header = request.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      throw new UnauthorizedException('missing bearer token');
    }

    request.user = this.authService.verifyToken(token);
    return true;
  }
}
