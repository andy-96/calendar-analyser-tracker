import { Injectable, Logger } from '@nestjs/common'
import firebase from 'firebase'

@Injectable()
export class FirebaseService {
  private firebase: firebase.app.App
  private database: firebase.database.Database
  private readonly logger = new Logger('FirebaseService')

  constructor () {
    this.firebase = firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    })
    this.database = firebase.database()
  }

  updateCategories (categories): Promise<boolean> {
    return this.database
      .ref(`categories/${categories.userId}`)
      .set({ ...categories.categoriesSparse })
      .then(() => {
        this.logger.log(`Successfully updated categories`)
        return true
      })
      .catch(err => {
        this.logger.error(`Something went wrong during updating the categories due to ${err}`)
        return false
      })
  }

  fetchCategories (userId: string) {
    return this.database
      .ref(`categories/${userId}`)
      .once('value')
      .then(categories => {
        // if user does not exist
        if (categories.val() === null) {
          return []
        }
        return categories.val()
      })
      .catch(err => {
        this.logger.error(`Something went wrong during fetching the categories due to ${err}`)
        return []
      })
  }
}