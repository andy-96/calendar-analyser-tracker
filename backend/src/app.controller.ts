import { Controller, Get } from '@nestjs/common'
import { GoogleService } from './google-service/google-service.service'
import { CalendarsEventsReponse } from './interfaces'

@Controller()
export class AppController {
  constructor(
    private readonly googleService: GoogleService
  ) {}

  @Get()
  async getCalendarsEvents(): Promise<CalendarsEventsReponse> {
    return await this.googleService.getCalendarsAndEvents()
  }
}
