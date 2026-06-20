import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private ready = false;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing. Configure apps/api/.env before starting the API.');
    }

    super({
      adapter: new PrismaPg(databaseUrl, {
        schema: 'public',
      }),
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRawUnsafe('SELECT 1');
      await this.assertCommerceSchema();
      this.ready = true;
      this.logger.log('Prisma connected and commerce schema is ready.');
    } catch (error) {
      this.ready = false;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Prisma startup check failed. ${message}. Run "npm run prisma:push" and "npm run prisma:seed" in apps/api after ensuring Postgres is reachable at ${this.maskDatabaseUrl(process.env.DATABASE_URL || '')}.`,
      );
      throw error;
    }
  }

  isReady() {
    return this.ready;
  }

  getMaskedDatabaseUrl() {
    return this.maskDatabaseUrl(process.env.DATABASE_URL || '');
  }

  async healthCheck() {
    try {
      await this.$queryRawUnsafe('SELECT 1');
      await this.assertCommerceSchema();

      return {
        ok: true,
        ready: this.ready,
        databaseUrl: this.getMaskedDatabaseUrl(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        ok: false,
        ready: this.ready,
        databaseUrl: this.getMaskedDatabaseUrl(),
        error: message,
      };
    }
  }

  private async assertCommerceSchema() {
    const requiredColumns = {
      Category: ['id', 'name', 'createdAt', 'updatedAt'],
      Product: ['id', 'name', 'description', 'price', 'stock', 'images', 'status', 'sellerId', 'categoryId', 'createdAt', 'updatedAt'],
      User: ['id', 'email', 'passwordHash', 'name', 'role', 'createdAt', 'updatedAt'],
      Cart: ['id', 'userId', 'createdAt', 'updatedAt'],
      CartItem: ['id', 'cartId', 'productId', 'quantity', 'createdAt', 'updatedAt'],
      Order: ['id', 'userId', 'status', 'address', 'total', 'createdAt', 'updatedAt'],
      OrderItem: ['id', 'orderId', 'productId', 'quantity', 'priceAtPurchase', 'createdAt'],
    } as const;

    const rows = await this.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('Category', 'Product', 'User', 'Cart', 'CartItem', 'Order', 'OrderItem')
    `);

    const columnMap = new Map<string, Set<string>>();
    for (const row of rows) {
      if (!columnMap.has(row.table_name)) {
        columnMap.set(row.table_name, new Set());
      }
      columnMap.get(row.table_name)?.add(row.column_name);
    }

    const problems: string[] = [];
    for (const [table, columns] of Object.entries(requiredColumns)) {
      const actualColumns = columnMap.get(table);
      if (!actualColumns) {
        problems.push(`missing table "${table}"`);
        continue;
      }

      const missingColumns = columns.filter((column) => !actualColumns.has(column));
      if (missingColumns.length) {
        problems.push(`table "${table}" is missing columns: ${missingColumns.join(', ')}`);
      }
    }

    if (problems.length) {
      throw new Error(`Database schema is out of date: ${problems.join('; ')}`);
    }
  }

  private maskDatabaseUrl(databaseUrl: string) {
    try {
      const url = new URL(databaseUrl);
      if (url.password) {
        url.password = '***';
      }
      return url.toString();
    } catch {
      return databaseUrl;
    }
  }
}
