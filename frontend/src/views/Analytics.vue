<template lang="pug">
  v-data-table(
    :headers="headers"
    :items="weeklyReviews"
  )
</template>

<script>
import moment from 'moment'
import { mongodb } from '../utils/index'

export default {
  name: 'Analytics',
  data: () => ({
    today: '',
    startTime: '',
    endTime: '',
    events: [],
    calendars: [],
    weeklyReviews: [],
    calendarWeeks: [],
    rangeInWeeks: 10,
    selectedCalendars: [],
    headers: [],
    userId: '',
  }),
  methods: {
    async getEvents() {
      try {
        const { data } = await mongodb.get('/events', {
          params: {
            start: this.startTime,
            end: this.endTime,
          },
        })
        this.events = data
      } catch (err) {
        console.error(`Could not fetch events due to ${err}`)
      }
    },
    async getCalendars() {
      try {
        const { data } = await mongodb.get('/calendars')
        this.calendars = this.selectedCalendars.map((id) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].id === id) {
              return {
                id,
                name: data[i].summary,
                color: data[i].backgroundColor,
                accessRole: data[i].accessRole,
              }
            }
          }
        })
      } catch (err) {
        console.error(`Could not fetch calendars due to ${err}`)
      }
    },
    async getSettings() {
      const { data } = await mongodb.get('/settings', {
        params: {
          userId: this.userId,
        },
      })
      this.selectedCalendars = data[0].selectedCalendars
    },
    createTableHeaders() {
      try {
        let headers = [{ text: 'Calendar Week', value: 'calendarWeek' }]
        const calendarHeaders = this.weeklyReviews[0].calendars.map(
          ({ name }, index) => {
            return {
              text: name,
              value: `calendars[${index}].duration`,
            }
          }
        )
        this.headers = headers.concat(calendarHeaders)
      } catch (err) {
        console.error(`Could not generate headers due to ${err}`)
        this.headers = []
      }
    },
    getWeeklyReviews() {
      this.weeklyReviews = this.calendarWeeks.map(
        ({ calendarWeek, startDay, endDay }) => {
          const calendarsInfo = this.calendars.map(({ name, id }) => {
            let totalDuration = 0
            for (let i = 0; i < this.events.length; i++) {
              if ('summary' in this.events[i]) {
                if (
                  this.events[i].organizer.email === id &&
                  typeof this.events[i].duration === 'number' &&
                  new Date(this.events[i].start.dateTime) >= startDay &&
                  new Date(this.events[i].end.dateTime) < endDay
                ) {
                  totalDuration = totalDuration + this.events[i].duration
                }
              }
            }
            return {
              id,
              name,
              duration: this.convertMilisecondsToHours(totalDuration),
            }
          })
          return {
            calendarWeek,
            startDay,
            endDay,
            calendars: calendarsInfo,
          }
        }
      )
    },
    convertMilisecondsToHours(time) {
      let hours = Math.floor(time / 1000 / 60 / 60)
      let minutes = Math.floor((time - hours * 1000 * 60 * 60) / 1000 / 60)
      // Fill up with zeros
      if (hours < 10) {
        hours = `0${hours}`
      }
      if (minutes < 10) {
        minutes = `0${minutes}`
      }
      return `${hours}:${minutes}`
    },
    getCalendarWeeks() {
      const thisWeek = moment(new Date()).week()
      let calendarWeeks = []
      for (let i = thisWeek; i > thisWeek - this.rangeInWeeks; i--) {
        let startDay = moment().day('sunday').week(i).toDate()
        let endDay = moment().day('saturday').week(i).toDate()
        calendarWeeks.push({
          calendarWeek: i,
          startDay,
          endDay,
        })
      }
      this.calendarWeeks = calendarWeeks
    },
    getEndTime(startTime, number, dateMonthYear) {
      // number: count of days, months, year back
      // dayMonthYear: specifies the mode -> day, month or year
      switch (dateMonthYear) {
        case 'd':
          return new Date(startTime.setDate(startTime.getDate() - number))
        case 'm':
          return new Date(startTime.setMonth(startTime.getMonth() - number))
        case 'y':
          return new Date(startTime.setYear(startTime.getYear() - number))
      }
    },
  },
  async mounted() {
    this.userId = 'Andy-Test'
    this.today = new Date()
    this.startTime = this.today
    const thisWeek = moment(this.startTime).week()
    this.endTime = moment()
      .day('sunday')
      .week(thisWeek - this.rangeInWeeks)
      .toDate()

    await this.getSettings()
    await Promise.all([this.getCalendars(), this.getEvents()]).then(() => {
      this.getCalendarWeeks()
      this.getWeeklyReviews()
      this.createTableHeaders()
    })
  },
}
</script>

<style lang="sass"></style>
