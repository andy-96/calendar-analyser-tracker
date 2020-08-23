const { google } = require('googleapis')
const readline = require('readline')
const { mongoDB, googleAuth } = require('./utils')

async function fetchCalendars () {
  const auth = await googleAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const { data: { items }} = await calendar.calendarList.list()
    .catch(err => console.error(err))
  return items
}

async function saveCalendars () {
  const calendars = await fetchCalendars()
  const mongo = await mongoDB()
  const calendarCollection = mongo.collection('calendars')
  calendarCollection.insertMany(calendars)
    .then(res => console.log('success'))
    .catch(err => console.error(err))
}

async function fetchEvents () {
  const calendar = google.calendar({ version: 'v3', auth: googleAuth() })
  const { data: { items }} = await calendar.events.list({
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  })
  .catch(err => console.log('yoo', err))
  return items
}

// TODO: saveEvents to mongoDB

function test() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('whaat'), 1000)
  })
}

;(async () => {
  const sth = await saveCalendars()
  console.log(sth)
})()