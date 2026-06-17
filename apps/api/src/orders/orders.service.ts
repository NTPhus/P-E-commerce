import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.serializeOrder(order);
  }

  serializeOrder(order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>) {
    return {
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        priceAtPurchase: Number(item.priceAtPurchase),
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
              unavailable: item.product.status !== ProductStatus.ACTIVE,
            }
          : null,
      })),
    };
  }
}
