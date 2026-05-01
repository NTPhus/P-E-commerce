import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.username, body.password, body.email);
  }

  @Public()
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }
}
