const { google } = require('googleapis')
const readline = require('readline')
const { mongoDB, googleAuth } = require('./utils')

const { MONGO_CALENDARS, MONGO_EVENTS } = require('./constants')

const fetchCalendars = async () => {
  const auth = await googleAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items },
  } = await calendar.calendarList.list().catch((err) => console.error(err))
  return items
}

const saveCalendars = async() => {
  const calendars = await fetchCalendars()
  const mongo = await mongoDB()
  const calendarCollection = mongo.collection(MONGO_CALENDARS)
  calendarCollection
    .insertMany(calendars)
    .then((res) => console.log('success'))
    .catch((err) => console.error(err))
}

const fetchEvents = async () => {
  const auth = await googleAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items },
  } = await calendar.events
    .list({
      calendarId: 'primary',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })
    .catch((err) => console.log('yoo', err))
  return items
}

const saveEvents = async () => {
  const events = await fetchEvents()
  const mongo = await mongoDB()
  const calendarCollection = mongo.collection(MONGO_EVENTS)
  calendarCollection
    .insertMany(events)
    .then((res) => console.log('success'))
    .catch((err) => console.error(err))
}


(async () => {
  await saveCalendars()
  await saveEvents()
})()
