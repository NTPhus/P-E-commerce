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
      },
    };

    const service = new OrdersService(prisma as any);
    const [order] = await service.listSellerOrders('seller-1');

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
});
