import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.ordersService.listOrders(user.id);
  }

  @Get(':id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ordersService.getOrder(user.id, id);
  }
}
