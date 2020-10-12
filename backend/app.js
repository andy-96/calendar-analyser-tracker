require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cookieSession = require('cookie-session')
const passport = require('passport')
const passportSetup = require('./config/passport')
const mongoose = require('mongoose')
const cors = require('cors')

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth/auth-routes')
const eventRouter = require('./routes/events/event-routes')
const calendarRouter = require('./routes/calendars/calendar-routes')
const settingsRouter = require('./routes/settings/settings-routes')

const { MONGO_DB, MONGO_USERNAME, MONGO_PASSWORD } = process.env

const app = express()

app.use(
  cors({
    origin: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true
  })
)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['qwefgfds']
  })
)

// initialize passport
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/events', eventRouter)
app.use('/calendars', calendarRouter)
app.use('/settings', settingsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// To setup mongoose connection
mongoose.connect(
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
)

var db = mongoose.connection
db.once('open', function () {
  console.log('Connection to MongoDB successful...')
}).on('error', function (error) {
  console.log('MongoDB connection error: ', error)
})

module.exports = app
