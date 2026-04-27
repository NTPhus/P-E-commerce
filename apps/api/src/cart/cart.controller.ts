import { Controller, Get, Post, Delete, Body, Param, Request } from '@nestjs/common'
import { CartService } from './cart.service'
import { Roles } from '../auth/roles.decorator'

@Controller('v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles('user', 'admin')
  get(@Request() req: any) {
    const userId = req.user?.id || req.headers['x-user-id']
    return this.cartService.getCart(userId)
  }

  @Post('add')
  @Roles('user', 'admin')
  add(@Body() dto: { productId: string; quantity: number }, @Request() req: any) {
    const userId = req.user?.id || req.headers['x-user-id']
    return this.cartService.addItem(userId, dto.productId, dto.quantity)
  }

  @Delete('remove/:productId')
  @Roles('user', 'admin')
  remove(@Param('productId') productId: string, @Request() req: any) {
    const userId = req.user?.id || req.headers['x-user-id']
    return this.cartService.removeItem(userId, productId)
  }

  @Delete('clear')
  @Roles('user', 'admin')
  clear(@Request() req: any) {
    const userId = req.user?.id || req.headers['x-user-id']
    return this.cartService.clearCart(userId)
  }
}
