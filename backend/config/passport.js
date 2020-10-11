const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { User } = require('../models')
require('dotenv').config()

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

// Passport takes that user id and stores it internally on
// req.session.passport which is passport’s internal
// mechanism to keep track of things.
passport.serializeUser((user, done) => {
  console.log('serializeUser:', user)
  done(null, user.id)
})

// makes a request to our DB to find the full profile information
// for the user and then calls done(null, user). This is where
// the user profile is attached to the request handler at req.user.
passport.deserializeUser((id, done) => {
  done(null, id)
})

// Implementing the passport github strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      User.findOne({ google: { googleId: profile.id } }).then((user) => {
        if (user) {
          // TODO: update access and refresh token
          // TODO: figure out where the error is thrown and why
          done(null, user)
        } else {
          new User({
            google: {
              googleId: profile.id
            }
          })
            .save()
            .then((newUser) => {
              done(null, newUser)
            })
        }
      })
      return done(null, {
        provider: 'google',
        id: profile.id,
        displayName: profile.displayName
      })
    }
  )
)
