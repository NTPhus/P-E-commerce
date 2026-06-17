import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async checkout(userId: string, input: { address?: string }) {
    const address = input.address?.trim();
    if (!address) {
      throw new BadRequestException('address is required');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('cart is empty');
      }

      for (const item of cart.items) {
        if (item.product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(`product ${item.product.name} is no longer available`);
        }
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(`insufficient stock for ${item.product.name}`);
        }
      }

      const total = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

      const createdOrder = await tx.order.create({
        data: {
          userId,
          address,
          total,
          status: OrderStatus.CONFIRMED,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    return this.ordersService.serializeOrder(order as any);
  }
}
