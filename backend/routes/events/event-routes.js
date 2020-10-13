const express = require('express')
const router = express.Router()
const { Event, User } = require('../../models/index')
const { updateMongo } = require('../../config/googleCalendar')
const { fetchGoogleInterval } = require('../../constants')

router.get('/', async (req, res) => {
  const { lastGoogleFetch } = await User.findOne({
    googleId: req.user.googleId
  })
  console.log(req.query.fetchFromGoogle)
  console.log(new Date() - lastGoogleFetch > fetchGoogleInterval)
  if (
    req.query.fetchFromGoogle === 'true' ||
    new Date() - lastGoogleFetch > fetchGoogleInterval
  ) {
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
