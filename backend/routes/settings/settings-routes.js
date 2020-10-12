const express = require('express')
const router = express.Router()
const { User } = require('../../models/index')

router.get('/', async (req, res) => {
  const data = await User.find({
    googleId: req.user.googleId
  })
  res.send(data)
})
router.post('/', async (req, res) => {
  await User.updateOne(
    {
      googleId: req.user.googleId
    },
    {
      $set: {
        selectedCalendars: req.body.selectedCalendars,
        calendarGroups: req.body.calendarGroups
      }
    }
  )
    .then(() => res.json({ status: 'success' }))
    .catch((err) => console.error(err))
})

module.exports = router
