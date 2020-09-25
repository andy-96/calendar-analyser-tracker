<template lang="pug">
  v-app
    v-app-bar(app color='blue-grey' dark)
      .d-flex.align-center
        v-img(
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        )
        v-toolbar-title Calendar Analyser
      v-spacer
    v-main
      v-row.fill-height
        v-col>
          v-sheet(height="64")
              v-btn(outlined class="mr-4" color="grey darken-2" @click="setToday")
                Today
              v-btn(fab text small color="grey darken-2" @click="prev")
                v-icon(small) mdi-chevron-left
              v-btn(fab text small color="grey darken-2" @click="next")
                v-icon(small) mdi-chevron-right
              v-toolbar-title(v-if="$refs.calendar")
                {{ $refs.calendar.title }}
              v-spacer
              v-menu(bottom right)
                template(v-slot:activator="{ on, attrs }")
                  v-btn(
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on"
                  )
                    span {{ typeToLabel[type] }}
                    v-icon(right) mdi-menu-down
                v-list
                  v-list-item(@click="type = 'day'")
                    v-list-item-title Day
                  v-list-item(@click="type = 'week'")
                    v-list-item-title Week
                  v-list-item(@click="type = 'month'")
                    v-list-item-title Month
                  v-list-item(@click="type = '4day'")
                    v-list-item-title 4 days
          v-sheet(height="600")
            v-calendar(
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-color="getEventColor"
              :type="type"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="updateRange"
            )
            v-menu(
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            )
              v-card(
                color="grey lighten-4"
                min-width="350px"
                flat
              )
                v-toolbar(
                  :color="selectedEvent.color"
                  dark
                )
                  v-btn(icon)
                    v-icon mdi-pencil
                  v-toolbar-title(v-html="selectedEvent.name")
                  v-spacer
                  v-btn(icon)
                    v-icon mdi-heart
                  v-btn(icon)
                    v-icon mdi-dots-vertical
                v-card-text
                  span(v-html="selectedEvent.details")
                v-card-actions
                  v-btn(
                    text
                    color="secondary"
                    @click="selectedOpen = false"
                  )
                    Cancel
</template>

<script>
import { mongodb } from './utils/index'

export default {
  name: 'App',
  data: () => ({
    events: [
      {
        name: 'Weekly Meeting',
        start: '2020-09-21 9:0',
        end: '2020-09-21 10:0',
      },
    ],
  }),
  computed: {},
  methods: {
    convertTime(dateTimeRaw) {
      try {
        const dateTime = new Date(dateTimeRaw)
        const year = dateTime.getFullYear()
        const month = dateTime.getMonth() + 1
        const date = dateTime.getDate()
        const hours = dateTime.getHours()
        const minutes = dateTime.getMinutes()
        return `${year}-${month}-${date} ${hours}:${minutes}`
      } catch (err) {
        console.log(dateTimeRaw)
      }
    },
    async getEvents() {
      const { data } = await mongodb.get('/events')
      this.events = data.map((event) => {
        let start = event.start.dateTime
        let end = event.end.dateTime
        if (typeof event.start.dateTime === 'undefined') {
          start = event.start.date
          end = event.end.date
        }
        return {
          name: event.summary,
          start: this.convertTime(start),
          end: this.convertTime(end),
        }
      })
    },
  },
  mounted() {
    this.getEvents()
  },
}
</script>

<style lang="sass" scoped>
calendar
  margin-top: 100px
</style>
