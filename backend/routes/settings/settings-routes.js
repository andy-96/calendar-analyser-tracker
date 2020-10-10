const express = require('express')
const router = express.Router()
const { Settings } = require('../../models/index')

router.get('/', async (req, res) => {
  const data = await Settings.find({
    userId: req.query.userId
  })
  res.send(data)
})
router.post('/', async (req, res) => {
  await Settings.updateOne(
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
