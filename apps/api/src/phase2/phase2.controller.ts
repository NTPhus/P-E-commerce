import { Controller, Get, Post, Body } from '@nestjs/common'
import { Phase2Service } from './phase2.service'

@Controller('v1/phase2')
export class Phase2Controller {
  constructor(private readonly s: Phase2Service) {}

  @Get('status')
  status() {
    return { ok: true, phase: 2 }
  }

  @Post('init')
  init(@Body() dto: any) {
    return this.s.initialize(dto)
  }
}
