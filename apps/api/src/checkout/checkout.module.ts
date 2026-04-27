import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { CartModule } from '../cart/cart.module'
import { CartService } from '../cart/cart.service'

@Module({
  imports: [CartModule],
  controllers: [CheckoutController],
  providers: [
    {
      provide: CheckoutService,
      useFactory: (cartService: CartService) => new CheckoutService(cartService),
      inject: [CartService],
    },
  ],
})
export class CheckoutModule {}
