import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface RequestWithUser extends Request {
  user?: AuthUser;
}
