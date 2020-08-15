const { google } = require('googleapis')
const { googleAuth } = require('./googleService.js')

const auth = googleAuth()

fetchEvents(auth)

async function fetchEvents (auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  const { data: { items }} = await calendar.events.list({
    calendarId: 'primary',
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  })
  .catch(err => console.log(err))
  console.log(items.length)
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
