import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { username: string; password: string; email?: string }) {
    return this.authService.register(dto.username, dto.password, dto.email)
  }

  @Post('login')
  login(@Body() dto: { username: string; password: string }) {
    return this.authService.login(dto.username, dto.password)
  }
}
