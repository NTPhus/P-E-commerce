import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async register(username: string, password123: string, email: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existing) {
      return { success: false, message: 'User already exists' };
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: password123, // NOTE: Use bcrypt in prod
        role: 'user'
      }
    });

    const { password, ...userWithoutPassword } = user;
    
    const payload = { sub: user.id, username: user.username, email: user.email, role: user.role };
    
    return {
      success: true,
      user: userWithoutPassword,
      token: this.jwtService.sign(payload)
    };
  }

  async login(username: string, password123: string) {
    const user = await this.prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.password !== password123) {
      return { success: false, message: 'Invalid credentials' };
    }

    const { password, ...userWithoutPassword } = user;
    
    const payload = { sub: user.id, username: user.username, email: user.email, role: user.role };

    return {
      success: true,
      user: userWithoutPassword,
      token: this.jwtService.sign(payload)
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
