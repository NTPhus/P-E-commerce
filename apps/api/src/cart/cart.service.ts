import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CartItem = { productId: string; quantity: number; price?: number }
export type Cart = { userId?: string; items: CartItem[]; total?: number; createdAt?: Date }

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId?: string) {
    if (!userId) return { items: [], total: 0 };
    
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      });
    }

    const items = cart.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.product.price,
    }));

    return { 
      id: cart.id,
      userId: cart.userId, 
      items, 
      total: this.calculateTotal(items),
      createdAt: cart.createdAt
    };
  }

  async addItem(userId: string | undefined, productId: string, quantity: number) {
    if (!userId) throw new BadRequestException('userId required');
    if (quantity <= 0) throw new BadRequestException('quantity must be > 0');
    
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }
    
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }
    
    return this.getCart(userId);
  }

  async removeItem(userId: string | undefined, productId: string) {
    if (!userId) throw new BadRequestException('userId required');
    
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (existingItem) {
      await this.prisma.cartItem.delete({ where: { id: existingItem.id } });
    }
    
    return this.getCart(userId);
  }

  async clearCart(userId: string | undefined) {
    if (!userId) throw new BadRequestException('userId required');
    
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    
    return { userId, items: [], total: 0 };
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  }
}
