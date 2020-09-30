<template lang="pug">
  .settings--main
    h1 Settings
    h3.settings--subsubheadline Select which calendars are relevant
    v-row(no-gutters)
      v-checkbox.checkbox(
        v-for="({ id, name }) in calendars"
        v-model="selectedCalendars"
        :key="id"
        :value="id"
        :label="name"
        dense
      )
    h3.settings--subsubheadline Create new groups
    p to be done...
    v-row
      v-spacer
      v-btn.col-md-2.ma-2(
        tile
      ) Cancel
      v-btn.col-md-2.ma-2(
        color="primary"
        tile
        @click="submitSettings"
      ) Submit
  
</template>

<script>
import { mongodb } from '../utils/index'

export default {
  name: 'Settings',
  data: () => ({
    calendars: [],
    selectedCalendars: [],
    userId: '',
  }),
  methods: {
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
    async getSettings() {
      const { data } = await mongodb.get('/settings', {
        params: {
          userId: this.userId,
        },
      })
      this.selectedCalendars = data[0].selectedCalendars
    },
    async submitSettings() {
      await mongodb
        .post('/settings', {
          userId: this.userId,
          selectedCalendars: this.selectedCalendars,
        })
        .then(() => alert('success'))
    },
  },
  async mounted() {
    this.userId = 'Andy-Test'
    await this.getCalendars()
    await this.getSettings()
  },
}
</script>

<style lang="sass" scoped>
.settings--subsubheadline
  margin-bottom: 10px

.checkbox
  width: calc(100% * (1/3) - 10px - 1px)

.v-input--selection-controls
  margin-top: 0
  padding-top: 0

.v-messages
  min-height: 0

.settings--main
  margin-left: 40px
</style>
