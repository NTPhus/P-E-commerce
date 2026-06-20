import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, ProductStatus, Role } from '@prisma/client';
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

  async listOrders(
    userId: string,
    input?: { status?: string; page?: number; pageSize?: number },
  ) {
    const pagination = this.normalizePagination(input);
    const where: Prisma.OrderWhereInput = {
      userId,
      ...this.buildStatusWhere(input?.status),
    };

    return this.listOrdersWithPagination(where, pagination);
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

  async cancelBuyerOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('only confirmed orders can be cancelled');
    }

    const updated = await this.updateOrderStatusTransactional(order, OrderStatus.CANCELLED);
    return this.serializeOrder(updated);
  }

  async listSellerOrders(
    sellerId: string,
    input?: { status?: string; page?: number; pageSize?: number },
  ) {
    const pagination = this.normalizePagination(input);
    const where: Prisma.OrderWhereInput = {
      items: {
        some: {
          product: {
            sellerId,
          },
        },
      },
      ...this.buildStatusWhere(input?.status),
    };

    return this.listOrdersWithPagination(where, pagination, sellerId);
  }

  async getSellerOrder(sellerId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.serializeOrder(order, sellerId);
  }

  async updateSellerOrderStatus(sellerId: string, orderId: string, body: { status?: OrderStatus }) {
    const status = body.status;
    if (!status || (status !== OrderStatus.SHIPPING && status !== OrderStatus.COMPLETED)) {
      throw new BadRequestException('status must be SHIPPING or COMPLETED');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    const hasForeignItems = order.items.some((item) => item.product.sellerId !== sellerId);
    if (hasForeignItems) {
      throw new BadRequestException('seller can only update orders that fully belong to their catalog');
    }
    if (status === OrderStatus.SHIPPING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('order must be confirmed before shipping');
    }
    if (status === OrderStatus.COMPLETED && order.status !== OrderStatus.SHIPPING) {
      throw new BadRequestException('order must be shipping before completion');
    }

    const updated = await this.updateOrderStatusTransactional(order, status);
    return this.serializeOrder(updated, sellerId);
  }

  async listAdminOrders(input?: { status?: string; page?: number; pageSize?: number }) {
    const pagination = this.normalizePagination(input);
    const where: Prisma.OrderWhereInput = {
      ...this.buildStatusWhere(input?.status),
    };

    return this.listOrdersWithPagination(where, pagination);
  }

  async updateAdminOrderStatus(orderId: string, body: { status?: OrderStatus }) {
    const status = body.status;
    if (
      !status ||
      (status !== OrderStatus.CONFIRMED &&
        status !== OrderStatus.SHIPPING &&
        status !== OrderStatus.COMPLETED &&
        status !== OrderStatus.CANCELLED)
    ) {
      throw new BadRequestException('status must be CONFIRMED, SHIPPING, COMPLETED or CANCELLED');
    }

    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    if (!existing) {
      throw new NotFoundException('order not found');
    }

    const updated = await this.updateOrderStatusTransactional(existing, status);
    return this.serializeOrder(updated);
  }

  async getAdminMetrics() {
    const [statusGroups, totals, categoryCount, sellerCount, buyerCount] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
      this.prisma.order.findMany({
        select: {
          total: true,
        },
      }),
      this.prisma.category.count(),
      this.prisma.user.count({ where: { role: Role.SELLER } }),
      this.prisma.user.count({ where: { role: Role.BUYER } }),
    ]);

    return {
      orderCount: totals.length,
      grossRevenue: totals.reduce((sum, order) => sum + Number(order.total), 0),
      categoryCount,
      sellerCount,
      buyerCount,
      byStatus: statusGroups.reduce((acc, group) => {
        acc[group.status] = group._count._all;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  serializeOrder(order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>, sellerId?: string) {
    return {
      ...order,
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        priceAtPurchase: Number(item.priceAtPurchase),
        belongsToSeller: sellerId ? item.product?.sellerId === sellerId : undefined,
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

  private async updateOrderStatusTransactional(
    order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>,
    status: OrderStatus,
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status },
        include: orderInclude,
      });
    });
  }

  private async listOrdersWithPagination(
    where: Prisma.OrderWhereInput,
    pagination: { page: number; pageSize: number },
    sellerId?: string,
  ) {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => this.serializeOrder(order, sellerId)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
    };
  }

  private normalizePagination(input?: { page?: number; pageSize?: number }) {
    return {
      page: Math.max(1, Number(input?.page) || 1),
      pageSize: Math.min(20, Math.max(1, Number(input?.pageSize) || 8)),
    };
  }

  private buildStatusWhere(status?: string): Prisma.OrderWhereInput {
    if (!status) {
      return {};
    }

    const allowedStatuses = Object.values(OrderStatus) as string[];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('invalid order status filter');
    }

    return {
      status: status as OrderStatus,
    };
  }
}
