const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { User } = require('../models')
require('dotenv').config()

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
} = process.env

// Passport takes that user id and stores it internally on
// req.session.passport which is passport’s internal
// mechanism to keep track of things.
passport.serializeUser((user, done) => {
  done(null, user._id)
})

// makes a request to our DB to find the full profile information
// for the user and then calls done(null, user). This is where
// the user profile is attached to the request handler at req.user.
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user))
})

// Implementing the passport github strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOneAndUpdate(
        {
          googleId: profile.id
        },
        {
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        },
        {
          new: true,
          upsert: true
        }
      )
      done(null, user)
    }
  )
)
