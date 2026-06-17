import { BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  it('creates an order, decrements stock, and clears cart', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const update = jest.fn().mockResolvedValue({});
    const create = jest.fn().mockResolvedValue({
      id: 'order-1',
      userId: 'buyer-1',
      status: 'CONFIRMED',
      address: '123 Demo Street',
      total: 74.49,
      createdAt: new Date('2026-06-17T00:00:00Z'),
      updatedAt: new Date('2026-06-17T00:00:00Z'),
      items: [
        {
          id: 'item-1',
          quantity: 1,
          priceAtPurchase: 24.99,
          product: {
            id: 'prod-1',
            name: 'Lamp',
            price: 24.99,
            status: 'ACTIVE',
            category: { id: 'cat-1', name: 'Home' },
          },
        },
      ],
    });

    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cart-1',
          items: [
            {
              id: 'cart-item-1',
              productId: 'prod-1',
              quantity: 1,
              product: {
                id: 'prod-1',
                name: 'Lamp',
                price: 24.99,
                stock: 3,
                status: 'ACTIVE',
                category: { id: 'cat-1', name: 'Home' },
              },
            },
          ],
        }),
      },
      order: { create },
      product: { update },
      cartItem: { deleteMany },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation((handler) => handler(tx)),
    };

    const ordersService = {
      serializeOrder: jest.fn((order) => order),
    };

    const service = new CheckoutService(prisma as any, ordersService as any);
    const result = await service.checkout('buyer-1', { address: '123 Demo Street' });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalled();
    expect(result.id).toBe('order-1');
  });

  it('fails when a cart item exceeds stock', async () => {
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cart-1',
          items: [
            {
              id: 'cart-item-1',
              productId: 'prod-1',
              quantity: 5,
              product: {
                id: 'prod-1',
                name: 'Lamp',
                price: 24.99,
                stock: 1,
                status: 'ACTIVE',
              },
            },
          ],
        }),
      },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation((handler) => handler(tx)),
    };

    const service = new CheckoutService(prisma as any, { serializeOrder: jest.fn() } as any);

    await expect(service.checkout('buyer-1', { address: '123 Demo Street' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
