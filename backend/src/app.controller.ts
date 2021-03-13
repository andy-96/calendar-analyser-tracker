import { Body, Controller, HttpException, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common'

import { FirebaseService } from './firebase/firebase.service'
import { GoogleService } from './google-service/google-service.service'
import { AuthenticatedGuard } from '@/guards/authenticated.guard'

@Controller()
export class AppController {
  private readonly logger = new Logger('AppController')

  constructor(
    private readonly googleService: GoogleService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  async getAllData(@Body() payload): Promise<any> {
    this.logger.log('Client has reloaded')
    const events = await this.googleService.getEvents()
    const categories = await this.firebaseService.fetchCategories(payload.userId)
    return {
      events, categories
    }
  }

  @Post('/test')
  async getAllTestData(@Body() payload): Promise<any> {
    this.logger.log('Client has reloaded')
    await this.googleService.authorize()
    const events = await this.googleService.getEvents()
    const categories = await this.firebaseService.fetchCategories(payload.userId)
    return {
      events, categories
    }
  }

  @Post('/save-categories')
  @UseGuards(AuthenticatedGuard)
  async saveCategories(@Body() categories): Promise<any> {
    if (await this.firebaseService.updateCategories(categories)) {
      return
    } else {
      throw new HttpException('There was an error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
