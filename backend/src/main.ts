import { NestFactory } from '@nestjs/core'
import * as passport from 'passport'
import * as session from 'express-session'
import flash = require('connect-flash')
import * as fs from 'fs'

import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'

const PORT =  Number(process.env.PORT) || 3000

async function bootstrap() {
  fs.readdir('../public', (err, files) => {
    if (err) return console.log(err)
    files.forEach(file => {
      console.log(file)
    })
  })
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
  await app.listen(PORT)
}
bootstrap()
