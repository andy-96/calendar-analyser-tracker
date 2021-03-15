import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'

import { AppController } from './app.controller'
import { GoogleModule } from '@/google-service/google-service.module'
import { ConfigModule } from '@nestjs/config'
import { FirebaseModule } from './firebase/firebase.module'
import { join } from 'path'

const envFilePath = () => {
  if (process.env.NODE_ENV === 'development') return '.env.development'
  if (process.env.NODE_ENV === 'production') return '.env.production'
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath()
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
