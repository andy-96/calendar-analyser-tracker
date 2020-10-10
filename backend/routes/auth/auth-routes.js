var express = require('express')
var router = express.Router()
var passport = require('passport')

router.get('/check', (req, res) => {
  if (typeof req.user !== 'undefined') {
    res.send({ msg: true })
  } else {
    res.send({ msg: false })
  }
})

router.get(
  '/google',
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/plus.login'
    ]
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:8080/#/analytics')
  }
)

router.get('/logout', (req, res, next) => {
  req.logout()
  res.json({ msg: 'Logged out' })
})

module.exports = router
