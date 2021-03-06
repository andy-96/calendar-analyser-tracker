import { Injectable, Logger } from '@nestjs/common'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { GaxiosResponse } from 'gaxios'
import * as fs from 'fs'
import * as util from 'util'
import * as readline from 'readline'

import { CalendarModel } from '@/data-models/calendars'
import { CalendarSparse, EventByCalendar, GoogleCalendar, GoogleCalendarList, GoogleEventList } from '@/interfaces'
import { EventsModel } from '@/data-models/events'

const readFile = util.promisify(fs.readFile)

@Injectable()
export class GoogleService {
  private googleCalendar: GoogleCalendar
  private calendars: CalendarModel = new CalendarModel
  private events: EventsModel = new EventsModel
  private readonly logger = new Logger('GoogleService')

  async authorizePassport(userData): Promise<void> {
    const oAuth2Client: OAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URIS
    )

    oAuth2Client.setCredentials({
      access_token: userData.accessToken
    })

    this.googleCalendar = google.calendar({ version: 'v3', auth: oAuth2Client })
  }

  async authorize(): Promise<void> {
    const oAuth2Client: OAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URIS
    )

    // Check if we have previously stored a token.
    try {
      const token = await readFile(process.env.GOOGLE_TOKEN_PATH)
      oAuth2Client.setCredentials(JSON.parse(token.toString()))
      this.googleCalendar = google.calendar({ version: 'v3', auth: oAuth2Client })
    } catch (err) {
      this.logger.warn(`Something went wrong while authorizing due to ${err}`)
      const auth = this.getAccessToken(oAuth2Client)
      if (typeof auth !== 'undefined') {
        this.googleCalendar = google.calendar({ version: 'v3', auth })
      }
    }
    this.logger.debug('authorized')
  }

  private getAccessToken(oAuth2Client: OAuth2Client): void | OAuth2Client {
    const authUrl: string = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: process.env.GOOGLE_SCOPES,
    })
    this.logger.debug('Authorize this app by visiting this url:', authUrl)
    const rl: readline.Interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close()
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return this.logger.error(`Error retrieving access token due to ${err}`)
        oAuth2Client.setCredentials(token)
        // Store the token to disk for later program executions
        fs.writeFile(process.env.GOOGLE_TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return this.logger.error(`Error writing token to file due to ${err}`)
          this.logger.debug('Token stored to', process.env.GOOGLE_TOKEN_PATH)
        })
        return oAuth2Client
      })
    })
  }

  async getEvents(): Promise<EventByCalendar[]> {
    this.logger.debug('getEvents')
    await this.fetchCalendars()
    const events = await this.fetchEvents()
    return events
  }

  private async fetchCalendars(): Promise<CalendarSparse[]> {
    try {
      const { data: { items } }: GaxiosResponse<GoogleCalendarList> = await this.googleCalendar
        .calendarList
        .list()
      this.logger.log(`Fetched ${items.length} calendars`)
      this.calendars.updateCalendars(items)
      return this.calendars.getCalendarsSparse()
    } catch(err) {
      this.logger.error(`Could not fetch calendars due to ${err}`)
    }
  }

  private async fetchEvents(): Promise<EventByCalendar[]> {
    try {
      this.events.updateCalendarModel(this.calendars)

      const calendarIds: { calendarId: string, calendarName: string }[] = this.calendars.getCalendarIdsNames()
      const start: Date = new Date()
      // TODO: make end Date dynamic or customizable!
      const end: Date = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate(), start.getHours(), start.getMinutes(), 0, 0)
      const events: EventByCalendar[] = await Promise.all(calendarIds.map(async ({ calendarId }) => {
        let pageToken = ''
        const requestedEvents = []
        // get all data by using the nextPageToken
        while (1) {
          const { data }: GaxiosResponse<GoogleEventList> = await this.googleCalendar.events
            .list({
              calendarId,
              timeMin: end.toISOString(),
              timeMax: start.toISOString(),
              singleEvents: true,
              orderBy: 'startTime',
              pageToken
            })
          requestedEvents.push(...data.items)
          if (typeof data.nextPageToken === 'undefined') {
            break
          }
          pageToken = data.nextPageToken
        }
        return { calendarId, events: requestedEvents }
      }))
      this.events.updateEvents(events, start, end)
      return this.events.getEventsByCalendarSparse()
    } catch (err) {
      this.logger.error(`Could not fetch events due to ${err}`)
    }
  }
}
