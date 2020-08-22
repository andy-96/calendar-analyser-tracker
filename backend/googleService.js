require('dotenv').config()
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const {
  client_secret,
  client_id,
  redirect_uris
} = process.env


const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const TOKEN_PATH = 'token.json'

exports.googleAuth = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris)
  
  // TODO: test whether token is still valid or not...
  let token = JSON.parse(fs.readFileSync(TOKEN_PATH))
  const today = Date.now()
  if (token.expiry_date - today < 0 ) {
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
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return JSON.stringify(token)
    });
  })
}