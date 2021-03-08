import { Injectable } from '@nestjs/common'
import { google } from 'googleapis'
import { calendar } from 'googleapis/build/src/apis/calendar'
import * as fs from 'fs'
import * as readline from 'readline'

@Injectable()
export class GoogleService {
  private auth

  constructor () {
    this.authorize()
  }

  private authorize(): void {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URIS
    )
  
    // Check if we have previously stored a token.
    fs.readFile(process.env.GOOGLE_TOKEN_PATH, (err, token) => {
      if (err) return this.getAccessToken(oAuth2Client)
      oAuth2Client.setCredentials(JSON.parse(token.toString()))
      this.auth = oAuth2Client
    })
  }

  private getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: process.env.GOOGLE_SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close()
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err)
        oAuth2Client.setCredentials(token)
        // Store the token to disk for later program executions
        fs.writeFile(process.env.GOOGLE_TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err)
          console.log('Token stored to', process.env.GOOGLE_TOKEN_PATH)
        })
        return oAuth2Client
      })
    })
  }  

  async fetchCalendars(): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth})
    const res = await calendar.calendarList
      .list()
      .catch((err) => console.error('Could not fetch calendars', err))
    console.log(res['data']['items'].map(({ summary }) => summary))
    return 'Hello World!'
  }
}
