const { google } = require('googleapis')
const { googleAuth } = require('./utils.js')
const {  }

async function main() {
  const auth = await googleAuth()

  // TODO: Save calendars and events to MongoDB!! Some kind of sync function
  // that fetches data from Google and compares it with MongoDB entries.
  const events = await fetchEvents(auth)
  const calendars = await fetchCalendars(auth)
  console.log(calendars.length)
  console.log(events.length)
}

main()
