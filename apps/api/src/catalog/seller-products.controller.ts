import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CatalogService } from './catalog.service';

@Controller('seller/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SELLER)
export class SellerProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.catalogService.listSellerProducts(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      images?: string[];
    },
  ) {
    return this.catalogService.createSellerProduct(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      images?: string[];
      status?: ProductStatus;
    },
  ) {
    return this.catalogService.updateSellerProduct(user.id, id, body);
  }

  @Delete(':id')
  archive(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.catalogService.archiveSellerProduct(user.id, id);
  }
}
