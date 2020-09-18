const { google } = require('googleapis')
const readline = require('readline')
const { mongoDB, googleAuth } = require('./utils')

const { MONGO_CALENDARS, MONGO_EVENTS } = require('./constants')

const fetchCalendars = async () => {
  const auth = await googleAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const {
    data: { items },
  } = await calendar.calendarList
    .list()
    .catch((err) => console.error('Could not fetch calendars', err))
  return items
}

const saveCalendars = async () => {
  let calendars = await fetchCalendars()
  const mongo = await mongoDB()
  const calendarCollection = mongo.collection(MONGO_CALENDARS)
  return calendarCollection
    .insertMany(calendars)
    .then((res) => {
      console.log('success')
      return res
    })
    .catch((err) => console.error('Could not save calendar', err))
}

const fetchEvents = async (calendarId) => {
  const auth = await googleAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const today = new Date()
  const tenDaysAgo = new Date()
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
  const {
    data: { items },
  } = await calendar.events
    .list({
      calendarId: 'primary',
      timeMin: tenDaysAgo,
      timeMax: today,
      singleEvents: true,
      orderBy: 'startTime',
    })
    .catch((err) => console.log('fetchEvents', err))
  return items
}

const saveEvents = async (calendarId) => {
  const events = await fetchEvents(calendarId)
  const mongo = await mongoDB()
  const calendarCollection = mongo.collection(MONGO_EVENTS)
  calendarCollection
    .insertMany(events)
    .then((res) => console.log('success'))
    .catch((err) => console.error(err))
}

;(async () => {
  const { ops: calendars } = await saveCalendars()
  calendars.map(async ({ id: calendarId }) => {
    await saveEvents(calendarId)
  })
})()
