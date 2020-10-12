const express = require('express')
const router = express.Router()
const { Event } = require('../../models/index')
const { updateMongo } = require('../../config/googleCalendar')

router.get('/', async (req, res) => {
  updateMongo(
    req.query.start,
    req.query.end,
    req.user.googleAccessToken,
    req.user.googleRefreshToken
  )
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
