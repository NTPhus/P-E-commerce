import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, verifyPassword } from './password';
import { AuthUser } from './auth.types';

type SanitizedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: { email?: string; password?: string; name?: string; role?: Role }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password?.trim();
    const name = input.name?.trim();
    const role = input.role ?? Role.BUYER;

    if (!email || !password || !name) {
      throw new BadRequestException('email, password, and name are required');
    }

    if (role !== Role.BUYER && role !== Role.SELLER) {
      throw new BadRequestException('self-registration supports only BUYER or SELLER');
    }

    if (password.length < 6) {
      throw new BadRequestException('password must be at least 6 characters');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: await hashPassword(password),
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(input: { email?: string; password?: string }) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password?.trim();

    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('user not found');
    }
    return this.sanitizeUser(user);
  }

  verifyToken(token: string): AuthUser {
    try {
      return jwt.verify(token, this.getJwtSecret()) as AuthUser;
    } catch {
      throw new UnauthorizedException('invalid token');
    }
  }

  private buildAuthResponse(user: User) {
    const safeUser = this.sanitizeUser(user);
    const token = jwt.sign(
      {
        id: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        name: safeUser.name,
      },
      this.getJwtSecret(),
      { expiresIn: '7d' },
    );

    return {
      token,
      user: safeUser,
    };
  }

  private sanitizeUser(user: User): SanitizedUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private getJwtSecret() {
    return this.configService.get<string>('JWT_SECRET') || 'commerce-core-dev-secret';
  }
}
