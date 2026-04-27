import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { Roles } from '../auth/roles.decorator'

@Controller('v1/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('start')
  @Roles('user', 'admin')
  start(@Body() dto: { paymentMethod?: string; shippingAddress?: string }, @Request() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id
    return this.checkoutService.startCheckout(userId, dto.paymentMethod, dto.shippingAddress)
  }

  @Post('pay/:orderId')
  @Roles('user', 'admin')
  pay(@Param('orderId') orderId: string, @Body() paymentInfo: any) {
    return this.checkoutService.processPayment(orderId, paymentInfo)
  }

  @Get(':orderId')
  @Roles('user', 'admin')
  getOrder(@Param('orderId') orderId: string) {
    const order = this.checkoutService.getOrder(orderId)
    if (!order) return { error: 'Order not found' }
    return order
  }

  @Get('user/orders')
  @Roles('user', 'admin')
  getUserOrders(@Request() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id
    return this.checkoutService.getUserOrders(userId)
  }

  @Post('complete/:orderId')
  @Roles('admin')
  complete(@Param('orderId') orderId: string) {
    return this.checkoutService.completeOrder(orderId)
  }
}
