import { Module } from '@nestjs/common'

import { FirebaseService } from '@/firebase/firebase.service'

@Module({
  imports: [],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}