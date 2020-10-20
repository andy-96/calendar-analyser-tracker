require('dotenv').config()
const { google } = require('googleapis')
const { Event, Calendar } = require('../models')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URIS } = process.env

const googleAuth = async (accessToken, refreshToken) => {
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URIS
  )
  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  })

  return oAuth2Client
}

const fetchCalendarsFromGoogle = async (auth) => {
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items }
  } = await calendar.calendarList
    .list()
    .catch((err) => console.error('Could not fetch calendars', err))
  return items
}

const saveCalendarsToMongo = async (calendarsGoogle) => {
  const calendarsMongo = await Calendar.find()

  // Only add or update items otherwise do nothing
  const { updatedCalendars, newCalendars } = getUpdatedAndNewCalendars(
    calendarsGoogle,
    calendarsMongo,
    'id'
  )
  if (newCalendars.length !== 0) {
    Calendar.insertMany(newCalendars).catch((err) =>
      console.error(`Could not save calendar due to ${err}`)
    )
  }
  if (updatedCalendars.length !== 0) {
    updatedCalendars.map(
      async (calendar) =>
        await Calendar.updateOne(
          { id: calendar['id'] },
          { $set: calendar }
        ).catch((err) =>
          console.error(`Could not save calendars due to ${err}`)
        )
    )
  }
  return console.log(
    `CALENDARS: ${newCalendars.length} were added and ${updatedCalendars.length} were updated!`
  )
}

const fetchEventsFromGoogle = async (auth, calendarId, start, end) => {
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items }
  } = await calendar.events
    .list({
      calendarId,
      timeMin: end,
      timeMax: start,
      singleEvents: true,
      orderBy: 'startTime'
    })
    .catch((err) =>
      console.error(`Could not fetch events from Google due to ${err}`)
    )
  return items
}

const saveEventsToMongo = async (eventsGoogle, calendarId) => {
  // TODO: specify date to be more performant
  const eventsMongo = await Event.find()

  // Only add or update items otherwise do nothing
  let { updatedEvents, newEvents } = getUpdatedAndNewEvents(
    eventsGoogle,
    eventsMongo,
    'id'
  )

  // Preprocessing
  newEvents = convertDateToISO(newEvents)
  updatedEvents = convertDateToISO(updatedEvents)
  newEvents = calculateEventDuration(newEvents)
  updatedEvents = calculateEventDuration(updatedEvents)

  if (newEvents.length !== 0) {
    newEvents = convertGadgetPreferencesToUnderscore(newEvents)
    Event.insertMany(newEvents).catch((err) =>
      console.error(`Could not save events due to ${err}`)
    )
  }
  if (updatedEvents.length !== 0) {
    updatedEvents.map(
      async (event) =>
        await Event.updateOne(
          { id: event['id'] },
          { $set: event }
        ).catch((err) => console.error(`Could not save events due to ${err}`))
    )
  }
  return console.log(
    // TODO: check whether successfull submit or not...
    `EVENTS (${calendarId}): ${newEvents.length} were added and ${updatedEvents.length} were updated!`
  )
}

const getUpdatedAndNewCalendars = (googleCalendars, mongoCalendars) => {
  const mongoCalendarsIDs = mongoCalendars.map((item) => item['id'])
  const googleCalendarsIDs = googleCalendars.map((item) => item['id'])
  const updatedCalendars = []
  const newCalendars = []
  for (let i = 0; i < googleCalendarsIDs.length; i++) {
    let found = false
    for (let j = 0; j < mongoCalendarsIDs.length; j++) {
      if (googleCalendarsIDs[i] === mongoCalendarsIDs[j]) {
        found = true
        let mongoCalendarCopy = mongoCalendars[j]
        delete mongoCalendarCopy['_id']
        if (
          JSON.stringify(googleCalendars[i]) !==
          JSON.stringify(mongoCalendarCopy)
        ) {
          updatedCalendars.push(googleCalendars[i])
        }
        break
      }
    }
    if (!found) {
      newCalendars.push(googleCalendars[i])
    }
  }
  return { updatedCalendars, newCalendars }
}

const getUpdatedAndNewEvents = (googleEvents, mongoEvents) => {
  const mongoEventsIDs = mongoEvents.map((item) => item['id'])
  const googleEventsIDs = googleEvents.map((item) => item['id'])
  const updatedEvents = []
  const newEvents = []
  for (let i = 0; i < googleEventsIDs.length; i++) {
    let found = false
    for (let j = 0; j < mongoEventsIDs.length; j++) {
      if (googleEventsIDs[i] === mongoEventsIDs[j]) {
        found = true
        if (googleEvents[i].updated !== mongoEvents[j].updated) {
          updatedEvents.push(googleEvents[i])
        }
        break
      }
    }
    if (!found) {
      newEvents.push(googleEvents[i])
    }
  }
  return { updatedEvents, newEvents }
}

const convertDateToISO = (events) => {
  return events.map((event) => {
    if ('dateTime' in event.start) {
      event.start.allDay = false
      return event
    } else if ('date' in event.start) {
      event.start.dateTime = event.start.date
      event.end.dateTime = event.end.date
      delete event.start.date
      delete event.end.date
      event.start.allDay = true
      return event
    }
  })
}

const calculateEventDuration = (events) => {
  return events.map((event) => {
    if (!event.start.allDay) {
      event.duration =
        new Date(event.end.dateTime) - new Date(event.start.dateTime)
      return event
    } else {
      event.duraton = 0
      return event
    }
  })
}

const convertGadgetPreferencesToUnderscore = (events) => {
  // MongoDB does not allow '.' in keys
  return events.map((event) => {
    if ('gadget' in event) {
      keys = Object.keys(event.gadget)
      for (let i = 0; i < keys.length; i++) {
        let newKey = keys[i].replace('.', '_')
        event['gadget'][newKey] = event['gadget'][keys[i]]
        delete event['gadget'][keys[i]]
      }
      return event
    }
    return event
  })
}

exports.updateMongo = async (start, end, accessToken, refreshToken) => {
  const auth = await googleAuth(accessToken, refreshToken)
  const calendars = await fetchCalendarsFromGoogle(auth)
  await saveCalendarsToMongo(calendars)

  return Promise.all(
    calendars.map(async ({ id: calendarId }) => {
      const events = await fetchEventsFromGoogle(auth, calendarId, start, end)
      await saveEventsToMongo(events, calendarId, start, end)
    })
  )
}
