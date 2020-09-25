<template lang="pug">
v-main
	v-row.fill-height
		v-col.col-2
			h1 YOOO
		v-col.col-10
			v-sheet(height="64")
				v-toolbar(flat color="white")
					v-btn(outlined class="mr-4" color="grey darken-2" @click="setToday") Today
					v-btn(fab text small color="grey darken-2" @click="prev")
						v-icon(small) mdi-chevron-left
					v-btn(fab text small color="grey darken-2" @click="next")
						v-icon(small) mdi-chevron-right
					v-toolbar-title(v-if="$refs.calendar") {{ $refs.calendar.title }}
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
					@click:more="viewDay"
					@click:date="viewDay"
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
						) Cancel
</template>

<script>
import { mongodb } from '../utils/index'

export default {
  name: 'Calendar',
  data: () => ({
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    calendars: [],
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
      this.events = data.map(
        ({ start, end, summary, organizer: { email } }) => {
          let timed = true
          let startTime = start.dateTime
          let endTime = end.dateTime
          if (typeof start.dateTime === 'undefined') {
            timed = false
            startTime = start.date
            endTime = end.date
          }

          // get backgroundcolor
          for (let i = 0; i < this.calendars.length; i++) {
            if (this.calendars[i].id === email) {
              return {
                name: summary,
                start: new Date(startTime),
                end: new Date(endTime),
                color: this.calendars[i].color,
                timed,
              }
            }
          }
          return {
            name: summary,
            start: new Date(startTime),
            end: new Date(endTime),
            color: '#AD1457',
            timed,
          }
        }
      )
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
    viewDay({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor(event) {
      return event.color
    },
    setToday() {
      this.focus = ''
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
  },
  mounted() {
    this.$refs.calendar.checkChange()
    this.getCalendars()
    this.getEvents()
  },
}
</script>

<style></style>
