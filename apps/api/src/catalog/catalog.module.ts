import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { SellerProductsController } from './seller-products.controller';

@Module({
  controllers: [CatalogController, SellerProductsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
