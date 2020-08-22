const { google } = require('googleapis')
const { googleAuth } = require('./googleService.js')

async function main() {
  const auth = await googleAuth()

  const events = await fetchEvents(auth)
  const calendars = await fetchCalendars(auth)
  console.log(calendars.length)
  console.log(events.length)
}

async function fetchCalendars (auth) {
  const calendar = google.calendar({ version: 'v3', auth})
  const { data: { items }} = await calendar.calendarList.list()
  return items
}

async function fetchEvents (auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  const { data: { items }} = await calendar.events.list({
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  })
  .catch(err => console.log('yoo', err))
  return items
}

function listEvents (auth) {
  const calendar = google.calendar({ version: 'v3', auth })
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

main()