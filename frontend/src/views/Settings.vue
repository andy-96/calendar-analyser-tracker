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
    async submitSettings() {
      const userId = 'Andy-Test'
      console.log(userId, this.selectedCalendars)
      await mongodb
        .post('/settings', {
          params: {
            userId,
            selectedCalendars: this.selectedCalendars,
          },
        })
        .then(() => console.log('success'))
    },
  },
  async mounted() {
    await this.getCalendars()
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
