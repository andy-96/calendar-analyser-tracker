const mongoose = require('mongoose')
const Schema = mongoose.Schema

const calendarSchema = new Schema({
  kind: String,
  etag: String,
  id: String,
  summary: String,
  timeZone: String,
  colorId: String,
  backgroundColor: String,
  foregroundColor: String,
  selected: Boolean,
  accessRole: String,
  defaultReminders: Array,
  conferenceProperties: Object,
  description: String,
  notificationSettings: Object,
  primary: Boolean
})

exports.Calendar = mongoose.model('calendars', calendarSchema)

const eventSchema = new Schema({
  kind: String,
  etag: String,
  id: String,
  status: String,
  htmlLink: String,
  created: String,
  updated: String,
  summary: String,
  creator: Object,
  organizer: Object,
  start: Object,
  end: Object,
  visibility: String,
  iCalUID: String,
  sequence: Schema.Types.Number,
  gadget: Object,
  duration: Schema.Types.Number,
  reminders: Object,
  duration: Schema.Types.Number
})

exports.Event = mongoose.model('events', eventSchema)

const userSchema = new Schema({
  userId: String,
  google: {
    googleId: String,
    googleAccessToken: String,
    googleRefreshToken: String
  },
  calendarGroups: Array,
  selectedCalendars: Array
})

exports.User = mongoose.model('user', userSchema)
