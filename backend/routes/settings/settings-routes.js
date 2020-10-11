const express = require('express')
const router = express.Router()
const { User } = require('../../models/index')

router.get('/', async (req, res) => {
  const data = await User.find({
    userId: req.query.userId
  })
  res.send(data)
})
router.post('/', async (req, res) => {
  await User.updateOne(
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

module.exports = router
