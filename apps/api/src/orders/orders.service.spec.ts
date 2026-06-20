import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('filters seller orders down to the seller items', async () => {
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'order-1',
            total: 49.98,
            status: OrderStatus.CONFIRMED,
            address: '123 Demo Street',
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [
              {
                id: 'item-1',
                quantity: 1,
                priceAtPurchase: 24.99,
                product: {
                  id: 'prod-1',
                  name: 'Lamp',
                  price: 24.99,
                  sellerId: 'seller-1',
                  status: 'ACTIVE',
                  category: { id: 'cat-1', name: 'Home' },
                },
              },
              {
                id: 'item-2',
                quantity: 1,
                priceAtPurchase: 24.99,
                product: {
                  id: 'prod-2',
                  name: 'Notebook',
                  price: 24.99,
                  sellerId: 'seller-2',
                  status: 'ACTIVE',
                  category: { id: 'cat-2', name: 'Lifestyle' },
                },
              },
            ],
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const service = new OrdersService(prisma as any);
    const result = await service.listSellerOrders('seller-1');
    const [order] = result.items;

    expect(order.items[0].belongsToSeller).toBe(true);
    expect(order.items[1].belongsToSeller).toBe(false);
  });

  it('rejects unsupported admin order statuses', async () => {
    const prisma = {
      order: {
        findUnique: jest.fn(),
      },
    };

    const service = new OrdersService(prisma as any);

    await expect(service.updateAdminOrderStatus('order-1', { status: OrderStatus.PENDING })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('restocks items when buyer cancels a confirmed order', async () => {
    const tx = {
      product: {
        update: jest.fn().mockResolvedValue({}),
      },
      order: {
        update: jest.fn().mockResolvedValue({
          id: 'order-1',
          total: 24.99,
          status: OrderStatus.CANCELLED,
          address: '123 Demo Street',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              quantity: 2,
              priceAtPurchase: 12.495,
              product: {
                id: 'prod-1',
                name: 'Notebook',
                sellerId: 'seller-1',
                price: 12.495,
                status: 'ACTIVE',
                category: { id: 'cat-1', name: 'Lifestyle' },
              },
            },
          ],
        }),
      },
    };

    const prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'order-1',
          total: 24.99,
          status: OrderStatus.CONFIRMED,
          address: '123 Demo Street',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              quantity: 2,
              priceAtPurchase: 12.495,
              product: {
                id: 'prod-1',
                name: 'Notebook',
                sellerId: 'seller-1',
                price: 12.495,
                status: 'ACTIVE',
                category: { id: 'cat-1', name: 'Lifestyle' },
              },
            },
          ],
        }),
      },
      $transaction: jest.fn().mockImplementation((handler) => handler(tx)),
    };

    const service = new OrdersService(prisma as any);
    const order = await service.cancelBuyerOrder('buyer-1', 'order-1');

    expect(tx.product.update).toHaveBeenCalled();
    expect(order.status).toBe(OrderStatus.CANCELLED);
  });

  it('rejects seller completion before shipping', async () => {
    const prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'order-1',
          total: 24.99,
          status: OrderStatus.CONFIRMED,
          address: '123 Demo Street',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              quantity: 1,
              priceAtPurchase: 24.99,
              product: {
                id: 'prod-1',
                name: 'Lamp',
                sellerId: 'seller-1',
                price: 24.99,
                status: 'ACTIVE',
                category: { id: 'cat-1', name: 'Home' },
              },
            },
          ],
        }),
      },
    };

    const service = new OrdersService(prisma as any);

    await expect(
      service.updateSellerOrderStatus('seller-1', 'order-1', { status: OrderStatus.COMPLETED }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
