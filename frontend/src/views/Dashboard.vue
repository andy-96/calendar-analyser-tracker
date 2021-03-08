<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(label="Set as unintresting" @click="")
  p-data-table(:value="events" v-model:selection="selectedCalendars" dataKey="calendarId")
    p-column(selectionMode="multiple" style="width: 3rem" :exportable="false")
    p-column(field="calendarName" header="Name")
    p-column(field="durationSinceMonday" header="Duration since Monday")
    p-column(field="totalDuration" header="Total Duration")
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

  msToTime(duration: number): string {
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const hoursString = hours < 10 ? '0' + hours : hours
    const minutesString = minutes < 10 ? '0' + minutes : minutes

    return hoursString + ':' + minutesString
  }

  createNewEventsTable(): void {
    this.events = this.rawEvents.map(({ events, ...calendarInfo }) => {
      const totalDuration = events
        .map(({ duration }) => duration)
        .reduce((a, b) => Number(a) + Number(b), 0)
      const totalDurationString = this.msToTime(totalDuration)

      // get latest time
      // TODO: not working properly...
      const durationSinceMonday = events
        .map(({ start, duration }) => {
          const now = new Date()
          const nowDay = now.getDay() - 1 // range is 0 - 6 (sunday - saturday)
          const lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDay, 0, 0, 0)
          if (lastMonday < new Date(start.dateTime)) {
            console.log(start.dateTime)
            return duration
          }
          return 0
        })
        .reduce((a, b) => Number(a) + Number(b), 0)
      const durationSinceMondayString = this.msToTime(durationSinceMonday)
      return {
        ...calendarInfo,
        events,
        totalDuration: totalDurationString,
        durationSinceMonday: durationSinceMondayString
      }
    })
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
