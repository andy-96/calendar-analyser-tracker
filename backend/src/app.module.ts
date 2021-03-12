import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { GoogleModule } from '@/google-service/google-service.module'
import { ConfigModule } from '@nestjs/config'
import { FirebaseModule } from './firebase/firebase.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    GoogleModule,
    FirebaseModule
  ],
  controllers: [AppController]
})
export class AppModule {}
