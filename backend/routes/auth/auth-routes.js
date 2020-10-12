require('dotenv').config()
const express = require('express')
const router = express.Router()
const passport = require('passport')

const { GOOGLE_SCOPES, FRONTEND_BASEURL } = process.env

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
    scope: GOOGLE_SCOPES
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${FRONTEND_BASEURL}/#/analytics`)
  }
)

router.get('/logout', (req, res, next) => {
  req.logout()
  res.json({ msg: 'Logged out' })
})

module.exports = router
