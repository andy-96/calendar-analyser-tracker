require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const { MONGO_DB, MONGO_CALENDARS, MONGO_EVENTS } = require('./constants')
const { MONGO_USERNAME, MONGO_PASSWORD } = process.env

const app = express()

MongoClient.connect(
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/<dbname>?retryWrites=true&w=majority`,
  {
    useUnifiedTopology: true,
  }
)
  .then((client) => {
    console.log('Connected to Database')
    db = client.db(MONGO_DB)

    app.use(bodyParser.urlencoded({ extended: true }))

    app.get('/events', (req, res) => {
      db.collection(MONGO_EVENTS)
        .find()
        .toArray()
        .then((results) => {
          console.log(results)
        })
    })
    app.post('/events', (req, res) => {
      db.collection(MONGO_EVENTS)
        .insertOne(req.body)
        .then((result) => {
          res.redirect('/')
        })
        .catch((error) => console.error(error))
    })

    app.listen(3000, function () {
      console.log('listening on 3000')
    })
  })
  .catch((err) => console.error(err))
