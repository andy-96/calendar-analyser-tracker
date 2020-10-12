const express = require('express')
const router = express.Router()
const { Calendar } = require('../../models')

router.get('/', async (req, res) => {
  const data = await Calendar.find()
  res.send(data)
})
router.post('/', (req, res) => {
  // ...
})

module.exports = router
