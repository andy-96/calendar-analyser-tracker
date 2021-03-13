import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import * as md5 from 'md5'

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
  async googleAuthRedirect(@Req() req, @Res() res) {
    const hashedEmail = md5(req.user.email)
    await this.googleService.authorizePassport(req.user)
    res.redirect(`/#/dashboard/${hashedEmail}`)
  }
}