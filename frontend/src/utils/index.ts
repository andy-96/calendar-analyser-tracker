import axios, { AxiosInstance } from 'axios'

export const backend: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_URL,
  timeout: 5000
})
