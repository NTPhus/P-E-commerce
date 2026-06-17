import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CatalogModule } from './catalog/catalog.module';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    CheckoutModule,
    ChatModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
