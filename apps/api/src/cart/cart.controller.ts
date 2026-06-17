import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: { id: string }) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: { id: string }, @Body() body: { productId?: string; quantity?: number }) {
    return this.cartService.addItem(user.id, body);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser() user: { id: string },
    @Param('productId') productId: string,
    @Body() body: { quantity?: number },
  ) {
    return this.cartService.updateItem(user.id, productId, body);
  }

  @Delete('items/:productId')
  removeItem(@CurrentUser() user: { id: string }, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.id, productId);
  }
}
