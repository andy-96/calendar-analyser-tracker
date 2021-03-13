import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'

import { AppController } from './app.controller'
import { GoogleModule } from '@/google-service/google-service.module'
import { ConfigModule } from '@nestjs/config'
import { FirebaseModule } from './firebase/firebase.module'
import { join } from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    GoogleModule,
    FirebaseModule
  ],
  controllers: [AppController]
})
export class AppModule {}
