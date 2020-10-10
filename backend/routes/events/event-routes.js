const express = require('express')
const router = express.Router()
const { Event } = require('../../models/index')

router.get('/', async (req, res) => {
  // TODO: await updateMongo(db, req.query.start, req.query.end)
  console.log(Event)
  const data = await Event.find({
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
  res.send(data)
})

router.post('/', (req, res) => {
  // ...
})

module.exports = router
