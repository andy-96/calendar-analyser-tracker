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

function listEvents () {
  const calendar = google.calendar({ version: 'v3', auth: googleAuth() })
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err)
    const events = res.data.items
    if (events.length) {
      console.log('Upcoming 10 events:')
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date
        console.log(`${start} - ${event.summary}`)
      })
    } else {
      console.log('No upcoming events found.')
    }
  })
}


function test() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('whaat'), 1000)
  })
}
;(async () => {
  const sth = await saveCalendars()
  console.log(sth)
})()