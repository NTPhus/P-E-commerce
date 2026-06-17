import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.CartInclude;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.ensureCart(userId);
    return this.serializeCart(cart);
  }

  async addItem(userId: string, input: { productId?: string; quantity?: number }) {
    const productId = input.productId?.trim();
    const quantity = Number(input.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('productId and positive quantity are required');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, status: ProductStatus.ACTIVE },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    const cart = await this.ensureCart(userId);
    const existing = cart.items.find((item) => item.productId === productId);
    const nextQuantity = (existing?.quantity || 0) + quantity;

    if (nextQuantity > product.stock) {
      throw new BadRequestException('quantity exceeds available stock');
    }

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: { quantity: nextQuantity },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, input: { quantity?: number }) {
    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('quantity must be an integer');
    }

    const cart = await this.ensureCart(userId);
    const existing = cart.items.find((item) => item.productId === productId);
    if (!existing) {
      throw new NotFoundException('cart item not found');
    }

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: existing.id } });
      return this.getCart(userId);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, status: ProductStatus.ACTIVE },
    });
    if (!product) {
      throw new BadRequestException('product is no longer available');
    }
    if (quantity > product.stock) {
      throw new BadRequestException('quantity exceeds available stock');
    }

    await this.prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.ensureCart(userId);
    const existing = cart.items.find((item) => item.productId === productId);
    if (!existing) {
      throw new NotFoundException('cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: existing.id } });
    return this.getCart(userId);
  }

  private async ensureCart(userId: string) {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (existing) {
      return existing;
    }

    return this.prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  private serializeCart(cart: Prisma.CartGetPayload<{ include: typeof cartInclude }>) {
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
      subtotal: Number(item.product.price) * item.quantity,
      available: item.product.status === ProductStatus.ACTIVE && item.product.stock >= item.quantity,
    }));

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  }
}
