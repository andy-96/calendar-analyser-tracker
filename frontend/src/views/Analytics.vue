<template lang="pug">
v-main
  v-simple-table(dense)
    template(v-slot:default)
      thead
        tr
          th.text-left Name
          th.text-left Calories
      tbody
        tr(v-for="({ name, id }) in calendars" :key="id")
          td {{ name }}
</template>

<script>
import { mongodb } from '../utils/index'

export default {
  name: 'Analytics',
  data: () => ({
    today: '',
    startTime: '',
    endTime: '',
    events: [],
    calendars: [],
  }),
  methods: {
    async getEvents() {
      const { data } = mongodb.get('/events', {
        params: {
          start: this.startTime,
          end: this.endTime,
        },
      })
      this.events = data
    },
    async getCalendars() {
      const { data } = await mongodb.get('/calendars')
      this.calendars = data.map(
        ({ summary, backgroundColor, accessRole, id }) => {
          return {
            id,
            name: summary,
            color: backgroundColor,
            accessRole,
          }
        }
      )
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
  mounted() {
    this.today = new Date()
    this.startTime = new Date()
    this.endTime = this.getEndTime(new Date(), 7, 'd')
    this.getCalendars()
    this.getEvents()
  },
}
</script>

<style lang="sass"></style>
