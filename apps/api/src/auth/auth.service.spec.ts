import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const configService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  it('registers a new user and returns a token', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: 'user-1',
          email: data.email,
          name: data.name,
          role: data.role,
          passwordHash: data.passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
    };

    const service = new AuthService(prisma as any, configService as any);
    const result = await service.register({
      email: 'buyer@example.com',
      password: 'buyer123',
      name: 'Buyer',
      role: Role.BUYER,
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('buyer@example.com');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('rejects duplicate emails on register', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing' }),
      },
    };

    const service = new AuthService(prisma as any, configService as any);

    await expect(
      service.register({
        email: 'buyer@example.com',
        password: 'buyer123',
        name: 'Buyer',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid login credentials', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new AuthService(prisma as any, configService as any);

    await expect(
      service.login({
        email: 'buyer@example.com',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
