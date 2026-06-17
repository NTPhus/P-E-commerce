import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('admin/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list() {
    return this.ordersService.listAdminOrders();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status?: OrderStatus }) {
    return this.ordersService.updateAdminOrderStatus(id, body);
  }
}
