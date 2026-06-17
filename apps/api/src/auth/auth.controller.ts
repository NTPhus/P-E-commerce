import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email?: string; password?: string; name?: string; role?: Role }) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: { id: string }) {
    return this.authService.getProfile(user.id);
  }
}
