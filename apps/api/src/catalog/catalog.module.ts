import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CategoriesController } from './categories.controller';
import { SellerProductsController } from './seller-products.controller';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController, SellerProductsController, CategoriesController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
