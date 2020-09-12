require('dotenv').config()
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const MongoClient = require('mongodb').MongoClient

const {
  client_secret,
  client_id,
  redirect_uris
} = process.env


const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const TOKEN_PATH = 'token.json'

exports.mongoDB = () => MongoClient.connect('mongodb://127.0.0.1:27017', {
  useUnifiedTopology: true
}).then(client => {
  console.log('Connected to Database')
  return client.db('calendar-analyser-tracker')})

exports.googleAuth = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris)
  
  //TODO: Promisify the try/catch...
  try {
    let token = JSON.parse(fs.readFileSync(TOKEN_PATH))
  } catch (err) {
    console.error(`Could not fetch token.json due to ${err}`)
    let token = 0
  }
  console.log(token)
  const today = Date.now()
  if (token.expiry_date - today < 0 ) {
    console.log('Token is expired')
    token = await getAccessToken(oAuth2Client)
  }
  oAuth2Client.setCredentials(token)
  
  return oAuth2Client
}

function getAccessToken (oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.setPrompt('Enter the code from that page here: ')
  rl.prompt()
  return new Promise((resolve, reject) => {
    rl.on('line', (userInput) => {
        response = userInput;
        rl.close();
    })
    rl.on('close', () => {
        resolve(response);
    })
  })
  .then(code => {
    return oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error('getToken', err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return JSON.stringify(token)
    })
  })
}