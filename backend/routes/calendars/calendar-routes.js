const express = require('express')
const router = express.Router()
const { Calendar } = require('../../models/index')

router.get('/', async (req, res) => {
  const data = await Calendar.find()
  res.send(data)
})
router.post('/', (req, res) => {
  // ...
})

module.exports = router
