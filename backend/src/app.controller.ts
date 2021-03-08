import { Controller, Get } from '@nestjs/common'
import { GoogleService } from './google-service/google-service.service';

@Controller()
export class AppController {
  constructor(
    private readonly googleService: GoogleService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return await this.googleService.fetchCalendars()
  }
}
