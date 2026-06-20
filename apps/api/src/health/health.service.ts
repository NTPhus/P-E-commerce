import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const database = await this.prisma.healthCheck();

    return {
      status: database.ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: {
          ok: true,
        },
        database,
      },
    };
  }
}
