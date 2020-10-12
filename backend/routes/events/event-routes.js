const express = require('express')
const router = express.Router()
const { Event, User } = require('../../models/index')
const { updateMongo } = require('../../config/googleCalendar')

router.get('/', async (req, res) => {
  if (req.query.fetchFromGoogle) {
    await updateMongo(
      req.query.start,
      req.query.end,
      req.user.googleAccessToken,
      req.user.googleRefreshToken
    )
  }
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
  console.log(req.user.googleId)
  await User.findOneAndUpdate(
    {
      googleId: req.user.googleId
    },
    {
      lastGoogleFetch: new Date()
    }
  )
  res.send(data)
})

router.post('/', (req, res) => {
  // ...
})

module.exports = router
