require('dotenv').config()
const cors = require('cors')
const express = require('express')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const { updateMongo } = require('./googleService')
const {
  MONGO_DB,
  MONGO_CALENDARS,
  MONGO_EVENTS,
  MONGO_SETTINGS,
  GOOGLE_SCOPES,
  MONGO_USERS
} = require('./constants')
const { connect } = require('mongodb')
const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = process.env

const app = express()

MongoClient.connect(
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
  {
    useUnifiedTopology: true
  }
)
  .then((client) => {
    console.log('Connected to Database')
    db = client.db(MONGO_DB)

    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    // TODO: change secret
    app.use(
      session({
        store: new MemoryStore({
          checkPeriod: 1000 * 60 * 60 * 24
        }),
        secret: 'something',
        resave: false,
        saveUninitialized: false
      })
    )
    app.use(passport.initialize())
    app.use(passport.session())

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: 'http://localhost:3030/auth/google/callback'
        },
        async (accessToken, refreshToken, token, profile, done) => {
          // TODO: change userId
          // await db.collection(MONGO_USERS).updateOne(
          //   {
          //     userId: 'Andy-Test'
          //   },
          //   {
          //     $set: {
          //       google_access_token: accessToken,
          //       google_refresh_token: refreshToken,
          //       expires_in: token.expires_in
          //     }
          //   },
          //   {
          //     upsert: true
          //   }
          // )
          return done(null, {
            google_access_token: accessToken,
            google_refresh_token: refreshToken,
            expires_in: token.expires_in,
            profile
          })
        }
      )
    )

    app.get('/', (req, res) => res.send('Hi Andy'))

    app.get(
      '/auth/google',
      passport.authenticate('google', {
        accessType: 'offline',
        prompt: 'consent',
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/plus.login'
        ]
      })
    )
    app.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (req, res) => {
        console.log(req.user)
        console.log(req.isAuthenticated())
        res.redirect('http://localhost:8080/#/analytics')
      }
    )

    app.get('/events', async (req, res) => {
      // TODO: await updateMongo(db, req.query.start, req.query.end)
      const data = await db
        .collection(MONGO_EVENTS)
        .find({
          $expr: {
            $and: [
              {
                $gte: [
                  {
                    $dateFromString: {
                      dateString: '$start.dateTime'
                    }
                  },
                  new Date(req.query.end)
                ]
              },
              {
                $lt: [
                  {
                    $dateFromString: {
                      dateString: '$start.dateTime'
                    }
                  },
                  new Date(req.query.start)
                ]
              }
            ]
          }
        })
        .toArray()
      res.send(data)
    })
    app.post('/events', (req, res) => {
      // ...
    })

    app.get('/calendars', async (req, res) => {
      const data = await db.collection(MONGO_CALENDARS).find().toArray()
      res.send(data)
    })
    app.post('/calendars', (req, res) => {
      // ...
    })

    app.get('/settings', async (req, res) => {
      const data = await db
        .collection(MONGO_SETTINGS)
        .find({
          userId: req.query.userId
        })
        .toArray()
      res.send(data)
    })
    app.post('/settings', async (req, res) => {
      await db
        .collection(MONGO_SETTINGS)
        .updateOne(
          {
            userId: req.body.userId
          },
          {
            $set: {
              selectedCalendars: req.body.selectedCalendars,
              calendarGroups: req.body.calendarGroups
            }
          },
          {
            upsert: true
          }
        )
        .then(() => res.json({ status: 'success' }))
        .catch((err) => console.error(err))
    })

    app.listen(3030, function () {
      console.log('listening on 3030')
    })
  })
  .catch((err) => console.error(err))
