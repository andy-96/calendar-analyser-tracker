import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const { VUE_APP_MONGODB_BASEURL } = process.env

export const mongodb = axios.create({
  baseURL: VUE_APP_MONGODB_BASEURL,
  timeout: 10000,
})
