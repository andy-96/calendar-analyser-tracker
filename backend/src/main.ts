import { NestFactory } from '@nestjs/core'
import * as passport from 'passport'
import * as session from 'express-session'
import flash = require('connect-flash')

import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())
  await app.listen(3000)
}
bootstrap()
