import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('seller/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SELLER)
export class SellerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.ordersService.listSellerOrders(user.id);
  }

  @Get(':id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ordersService.getSellerOrder(user.id, id);
  }
}
