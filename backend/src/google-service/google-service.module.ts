import { Module } from '@nestjs/common'

import { GoogleStrategy } from '@/google-service/google-auth.service'
import { GoogleService } from '@/google-service/google-service.service'
import { GoogleServiceController } from '@/google-service/google-service.controller'
import { PassportModule } from '@nestjs/passport'
import { SessionSerializer } from './session.serializer'

@Module({
  imports: [PassportModule],
  providers: [GoogleStrategy, GoogleService, SessionSerializer],
  controllers: [GoogleServiceController],
  exports: [GoogleService]
})
export class GoogleModule {}
