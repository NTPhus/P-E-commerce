import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(@CurrentUser() user: { id: string }, @Body() body: { address?: string }) {
    return this.checkoutService.checkout(user.id, body);
  }
}
