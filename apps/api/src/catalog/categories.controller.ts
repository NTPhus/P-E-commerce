import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CatalogService } from './catalog.service';

@Controller('admin/categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CategoriesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  create(@Body() body: { name?: string }) {
    return this.catalogService.createCategory(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.catalogService.updateCategory(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }
}
