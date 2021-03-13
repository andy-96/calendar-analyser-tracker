import axios, { AxiosInstance } from 'axios'

export const backend: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_URL,
  timeout: 10000
})

export const msToTime = (duration: number): string => {
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor(duration / (1000 * 60 * 60))
  const hoursString = hours < 10 ? '0' + hours : hours
  const minutesString = minutes < 10 ? '0' + minutes : minutes

  return hoursString + ':' + minutesString
}