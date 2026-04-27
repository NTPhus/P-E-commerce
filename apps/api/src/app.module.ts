import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { CartModule } from './cart/cart.module'
import { CheckoutModule } from './checkout/checkout.module'
import { ProductModule } from './catalog/catalog.module'

@Module({
  imports: [AuthModule, ProductModule, CartModule, CheckoutModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
