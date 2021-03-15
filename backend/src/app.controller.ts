import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Request, Res, UseGuards } from '@nestjs/common'
import * as md5 from 'md5'

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
  async getAllData(@Body() payload, @Request() req): Promise<any> {
    this.logger.log('Client has reloaded')
    if (md5(req.user.email) !== payload.userId) {
      throw new HttpException('Not Authorized!', HttpStatus.UNAUTHORIZED)
    }
    const events = await this.googleService.getEvents()
    const categories = await this.firebaseService.fetchCategories(payload.userId)
    return {
      events, categories
    }
  }

  @Post('/test')
  async getAllTestData(@Body() payload, @Request() res): Promise<any> {
    this.logger.log('Client has reloaded')
    await this.googleService.authorize()
    const events = await this.googleService.getEvents()
    const categories = await this.firebaseService.fetchCategories(payload.userId)
    console.log(res)
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

  @Post('/save-categories-test')
  async saveCategoriesTest(@Body() categories): Promise<any> {
    if (await this.firebaseService.updateCategories(categories)) {
      return
    } else {
      throw new HttpException('There was an error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('/logout')
  logout(@Request() req): string {
    this.logger.log('Logout!')
    req.logout()
    return 'success'
  }
}
