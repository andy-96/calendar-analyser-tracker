<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(label="Unfocus" @click="clickOnUnfocus")
  p-data-table(
    :value="events"
    v-model:selection="selectedCalendars"
    v-model:expandedRows="expandedRows"
    @rowExpand="expandRow"
    @rowCollapse=""
    dataKey="calendarId"
  )
    p-column(:expander="true" headerStyle="width: 3rem")
    p-column(selectionMode="multiple" style="width: 3rem" :exportable="false")
    p-column(field="calendarName" header="Name")
    p-column(field="durationSinceMondayString" header="Duration since Monday")
    p-column(field="threeMonthAverageString" header="Three month average")
    p-column(field="totalDurationString" header="Total Duration")
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { backend } from '@/utils'
import { EventByCalendar, CalendarSparse } from '@/interfaces'

@Options({})
export default class Home extends Vue {
  calendars: CalendarSparse[] = []
  rawEvents: EventByCalendar[] = []
  events: EventByCalendar[] = []
  selectedCalendars: EventByCalendar[] = []
  expandedRows: EventByCalendar[] = []

  msToTime(duration: number): string {
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const hoursString = hours < 10 ? '0' + hours : hours
    const minutesString = minutes < 10 ? '0' + minutes : minutes

    return hoursString + ':' + minutesString
  }

  clickOnUnfocus (): void {
    this.selectedCalendars.map(({ calendarId }) => {
      const index = this.events.findIndex(({ calendarId: origCalId }) => calendarId === origCalId)
      this.events.splice(index, 1)
    })
    this.events.push(...this.selectedCalendars)
    this.selectedCalendars = []
  }

  expandRow (): void {
    alert('yo')
  }

  createNewEventsTable(): void {
    const now = new Date()
    const nowDay = now.getDay() - 1 // range is 0 - 6 (sunday - saturday)
    const lastMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - nowDay,
      0,
      0,
      0
    )
    const monthBegin = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 0)
    this.events = this.rawEvents
      .map(({ events, ...calendarInfo }) => {
        const totalDuration = events
          .map(({ duration }) => duration)
          .reduce((a, b) => Number(a) + Number(b), 0)
        const totalDurationString = this.msToTime(totalDuration)

        // Get latest duration
        const durationSinceMonday = events
          .map(({ start, duration }) => {
            if (lastMonday < new Date(start.dateTime)) {
              return duration
            }
            return 0
          })
          .reduce((a, b) => Number(a) + Number(b), 0)
        const durationSinceMondayString = this.msToTime(durationSinceMonday)

        // Get average duration
        let threeMonthAverage = events
          .map(({ start, duration }) => {
            const date = new Date(start.dateTime)
            if (date > monthBegin && date < monthEnd) {
              return duration
            }
            return 0
          })
          .reduce((a, b) => Number(a) + Number(b), 0)
        threeMonthAverage = threeMonthAverage / ((Number(monthEnd) - Number(monthBegin)) / 1000 / 60 / 60 / 24 / 7)
        const threeMonthAverageString = this.msToTime(threeMonthAverage)
        return {
          ...calendarInfo,
          events,
          totalDuration,
          totalDurationString,
          threeMonthAverage,
          threeMonthAverageString,
          durationSinceMonday,
          durationSinceMondayString
        }
      })
      // sort by date
      .sort((a, b) => b.durationSinceMonday - a.durationSinceMonday)
  }

  async mounted() {
    const {
      data: { calendars, events }
    } = await backend.get('/')
    this.calendars = calendars
    this.rawEvents = events
    this.createNewEventsTable()
  }
}
</script>
