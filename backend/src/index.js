require('dotenv').config()
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const { updateMongo } = require('./googleService')
const {
  MONGO_DB,
  MONGO_CALENDARS,
  MONGO_EVENTS,
  MONGO_SETTINGS
} = require('./constants')
const { MONGO_USERNAME, MONGO_PASSWORD } = process.env

const app = express()

MongoClient.connect(
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/<dbname>?retryWrites=true&w=majority`,
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

    app.get('/', (req, res) => res.send('Hi Andy'))

    app.get('/events', async (req, res) => {
      await updateMongo(db, req.query.start, req.query.end)
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
      console.log(data.length)
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
              selectedCalendars: req.body.selectedCalendars
            }
          },
          {
            upsert: true
          }
        )
        .then(() => res.json({ status: 'success' }))
        .catch((err) => console.error(err))
    })

    app.listen(3000, function () {
      console.log('listening on 3000')
    })
  })
  .catch((err) => console.error(err))
