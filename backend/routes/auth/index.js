var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/check', (req, res) => {
  console.log(req.user)
  console.log(req.isAuthenticated())
  if (typeof req.user !== 'undefined') {
    res.send(true)
  }
  res.send(false)
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
    console.log(req.user)
    console.log(req.isAuthenticated())
    res.redirect('http://localhost:8080/#/analytics')
  }
)

module.exports = router