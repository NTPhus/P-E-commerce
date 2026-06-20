import { BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';

describe('CartService', () => {
  it('rejects adding products from multiple sellers into one cart', async () => {
    const prisma = {
      product: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'prod-2',
          sellerId: 'seller-2',
          stock: 10,
        }),
      },
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cart-1',
          userId: 'buyer-1',
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              quantity: 1,
              product: {
                seller: { id: 'seller-1', name: 'Seller One' },
                price: 10,
                stock: 10,
                status: 'ACTIVE',
              },
            },
          ],
        }),
      },
    };

    const service = new CartService(prisma as any);

    await expect(service.addItem('buyer-1', { productId: 'prod-2', quantity: 1 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
