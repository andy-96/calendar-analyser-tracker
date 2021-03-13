import { Controller, Get, Req, UseGuards } from '@nestjs/common'

import { LoginGuard } from '@/guards/login.guard'
import { GoogleService } from './google-service.service'

@Controller('google')
export class GoogleServiceController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  @UseGuards(LoginGuard)
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(LoginGuard)
  googleAuthRedirect(@Req() req) {
    return this.googleService.authorizePassport(req.user)
  }
}