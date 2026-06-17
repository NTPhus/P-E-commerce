import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from './auth.types';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
});
