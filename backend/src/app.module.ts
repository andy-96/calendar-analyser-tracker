import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { GoogleModule } from '@/google-service/google-service.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    GoogleModule
  ],
  controllers: [AppController]
})
export class AppModule {}
