import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  categories() {
    return this.catalogService.listCategories();
  }

  @Get('products')
  products(@Query('categoryId') categoryId?: string) {
    return this.catalogService.listProducts(categoryId);
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }
}
