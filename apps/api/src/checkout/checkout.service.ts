import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService, CartItem } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';

@Injectable()
export class CheckoutService {
  constructor(
    private cartService: CartService,
    private prisma: PrismaService
  ) {}

  async startCheckout(userId: string, paymentMethod?: string, shippingAddress?: string) {
    if (!userId) throw new BadRequestException('userId required');

    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const total = cart.total || 0;

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        paymentMethod,
        shippingAddress,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || 0
          }))
        }
      }
    });

    return { orderId: order.id, total };
  }

  async processPayment(orderId: string, paymentInfo: any) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== 'pending') throw new BadRequestException(`Order ${orderId} already processed`);

    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' }
      });
      await this.cartService.clearCart(order.userId);
      return { success: true, orderId, status: 'paid' };
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' }
      });
      return { success: false, orderId, status: 'cancelled' };
    }
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async completeOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== 'paid') throw new BadRequestException('Order must be paid before completion');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' }
    });

    return { success: true, order: updated };
  }
}
