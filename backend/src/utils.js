require('dotenv').config()
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const MongoClient = require('mongodb').MongoClient

const { GOOGLE_SCOPES, GOOGLE_TOKEN_PATH, MONGO_DB } = require('./constants')
const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  CLIENT_SECRET,
  CLIENT_ID,
  REDIRECT_URIS,
} = process.env

exports.mongoDB = () =>
  MongoClient.connect(
    `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@calendar-analyser-track.uaqxp.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
    }
  ).then((client) => {
    console.log('Connected to Database')
    return client.db(MONGO_DB)
  })

exports.googleAuth = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URIS
  )

  let token = { expiry_date: 0 }
  if (fs.existsSync(GOOGLE_TOKEN_PATH)) {
    token = JSON.parse(fs.readFileSync(GOOGLE_TOKEN_PATH))
  }

  const today = Date.now()
  if (token.expiry_date - today < 0) {
    console.log('Token is expired')
    token = await getAccessToken(oAuth2Client)
  }
  oAuth2Client.setCredentials(token)

  return oAuth2Client
}

async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.setPrompt('Enter the code from that page here: ')
  rl.prompt()
  return new Promise((resolve, reject) => {
    rl.on('line', (userInput) => {
      response = userInput
      rl.close()
    })
    rl.on('close', () => {
      resolve(response)
    })
  }).then(async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code)
      fs.writeFileSync(GOOGLE_TOKEN_PATH, JSON.stringify(tokens))
      return tokens
    } catch (err) {
      console.error('Error retrieving access token', err)
    }
  })
}
