import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post } from '@nestjs/common'
import { Http2ServerResponse } from 'node:http2'
import { FirebaseService } from './firebase/firebase.service'
import { GoogleService } from './google-service/google-service.service'
import { EventByCalendar } from './interfaces'

@Controller()
export class AppController {
  private readonly logger = new Logger('AppController')

  constructor(
    private readonly googleService: GoogleService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  async getAllData(@Body() payload): Promise<any> {
    this.logger.log('Client has reloaded')
    const events = await this.googleService.getEvents()
    const categories = await this.firebaseService.fetchCategories(payload.userId)
    return {
      events, categories
    }
  }

  @Post('/save-categories')
  async saveCategories(@Body() categories): Promise<any> {
    if (await this.firebaseService.updateCategories(categories)) {
      return
    } else {
      throw new HttpException('There was an error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
