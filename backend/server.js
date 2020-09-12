require('dotenv').config()
const express = require('express')
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()

const {
  MONGO_USERNAME,
  MONGO_PASSWORD
} = process.env


MongoClient.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/<dbname>?retryWrites=true&w=majority`, {
  useUnifiedTopology: true
})
  .then(client => {
    console.log('Connected to Database')
    db = client.db('star-wars-quote')
    const quotesCollection = db.collection('quotes')

    app.use(bodyParser.urlencoded({ extended: true }))

    app.get('/', (req, res) => {
      db.collection('quotes').find().toArray()
        .then(results => {
          console.log(results)
        })
      res.sendFile(__dirname + '/index.html')
    })
    app.post('/quotes', (req, res) => {
      quotesCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
    })
    
    app.listen(3000, function() {
      console.log('listening on 3000')
    })

  })
  .catch(err => console.error(err))