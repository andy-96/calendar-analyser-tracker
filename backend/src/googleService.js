const { google } = require('googleapis')
const readline = require('readline')
const { mongoDB, googleAuth } = require('./utils')

const { MONGO_CALENDARS, MONGO_EVENTS } = require('./constants')
const { calendar } = require('googleapis/build/src/apis/calendar')

const fetchCalendarsFromGoogle = async (auth) => {
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items },
  } = await calendar.calendarList
    .list()
    .catch((err) => console.error('Could not fetch calendars', err))
  return items
}

const saveCalendarsToMongo = async (mongo, calendarsGoogle) => {
  const calendarCollection = mongo.collection(MONGO_CALENDARS)
  const calendarsMongo = await calendarCollection.find().toArray()

  // Only add or update items otherwise do nothing
  const {
    updatedItems: updatedCalendars,
    newItems: newCalendars,
  } = getUpdatedAndNewItems(calendarsGoogle, calendarsMongo, 'id')
  if (newCalendars.length !== 0) {
    calendarCollection
      .insertMany(newCalendars)
      .catch((err) => console.error(`Could not save calendar due to ${err}`))
  }
  if (updatedCalendars.length !== 0) {
    updatedCalendars.map(
      async (calendar) =>
        await calendarCollection
          .updateOne({ id: calendar['id'] }, { $set: calendar })
          .catch((err) =>
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
    data: { items },
  } = await calendar.events
    .list({
      calendarId,
      timeMin: end,
      timeMax: start,
      singleEvents: true,
      orderBy: 'startTime',
    })
    .catch((err) =>
      console.error(`Could not fetch events from Google due to ${err}`)
    )
  return items
}

const saveEventsToMongo = async (mongo, eventsGoogle, start, end) => {
  const eventCollection = mongo.collection(MONGO_EVENTS)
  // TODO: specify date to be more performant
  const eventsMongo = await eventCollection.find().toArray()

  // Only add or update items otherwise do nothing
  const {
    updatedItems: updatedEvents,
    newItems: newEvents,
  } = getUpdatedAndNewItems(eventsGoogle, eventsMongo, 'id')
  if (newEvents.length !== 0) {
    eventCollection
      .insertMany(newEvents)
      .catch((err) => console.error(`Could not save events due to ${err}`))
  }
  if (updatedEvents.length !== 0) {
    updatedEvents.map(
      async (event) =>
        await eventCollection
          .updateOne({ id: calendar['id'] }, { $set: event })
          .catch((err) => console.error(`Could not save events due to ${err}`))
    )
  }
  return console.log(
    `EVENTS: ${newEvents.length} were added and ${updatedEvents.length} were updated!`
  )
}

const getUpdatedAndNewItems = (googleItems, mongoItems, comparison) => {
  const mongoItemsIDs = mongoItems.map((item) => item[comparison])
  const googleItemsIDs = googleItems.map((item) => item[comparison])
  const updatedItems = []
  const newItems = []
  for (let i = 0; i < googleItemsIDs.length; i++) {
    let found = false
    for (let j = 0; j < mongoItemsIDs.length; j++) {
      if (googleItemsIDs[i] === mongoItemsIDs[j]) {
        found = true
        let mongoItemCopy = mongoItems[j]
        delete mongoItemCopy['_id']
        if (JSON.stringify(googleItems[i]) !== JSON.stringify(mongoItemCopy)) {
          console.log(googleItems[i])
          console.log(mongoItemCopy)
          updatedItems.push(googleItems[i])
        }
        break
      }
    }
    if (!found) {
      newItems.push(googleItems[i])
    }
  }
  return { updatedItems, newItems }
}

;(async () => {
  const auth = await googleAuth()
  const mongo = await mongoDB()
  const calendars = await fetchCalendarsFromGoogle(auth)
  await saveCalendarsToMongo(mongo, calendars)
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() - 7)

  calendars.map(async ({ id: calendarId }) => {
    const events = await fetchEventsFromGoogle(auth, calendarId, start, end)
    await saveEventsToMongo(mongo, events, start, end)
  })
})()
