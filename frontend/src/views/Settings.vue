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
        hide-details
      )
    h3.settings--subsubheadline Create new group
    v-text-field(
      label="Group Name"
      append-icon="mdi-plus"
      v-model="newGroupName"
      @click:append="clickOnAppend"
    )
    p Select which calendars belongs this group
    v-row(no-gutters)
      v-checkbox.checkbox(
        v-for="({ id, name }) in calendars"
        v-model="newGroupSelectedCalendars"
        :key="id"
        :value="id"
        :label="name"
        dense
        hide-details
      )
    v-container(v-for="({ groupName, selectedCalendars }, index) in calendarGroups" :key='index')
      v-text-field(
        v-model="groupName"
        append-icon="mdi-check"
        prepend-icon="mdi-minus"
        @click:append="clickOnCheck(groupName, selectedCalendars, index)"
        @click:prepend="clickOnPrepend(index)"
      )
      v-row(no-gutters)
        v-checkbox.checkbox(
          v-for="({ id, name }) in calendars"
          v-model="selectedCalendars"
          :key="id"
          :value="id"
          :label="name"
          dense
          hide-details
        )
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
    newGroupName: '',
    calendars: [],
    selectedCalendars: [],
    calendarGroups: [],
    newGroupSelectedCalendars: [],
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
      const { data } = await mongodb.get('/settings')
      this.selectedCalendars = data[0].selectedCalendars
      this.calendarGroups = data[0].calendarGroups
    },
    async submitSettings() {
      await mongodb
        .post('/settings', {
          selectedCalendars: this.selectedCalendars,
          calendarGroups: this.calendarGroups,
        })
        .then(() => alert('success'))
    },
    clickOnAppend() {
      this.calendarGroups.unshift({
        groupName: this.newGroupName,
        selectedCalendars: this.newGroupSelectedCalendars,
      })
      this.newGroupName = ''
      this.newGroupSelectedCalendars = []
    },
    clickOnCheck(groupName, selectedCalendars, index) {
      this.calendarGroups[index].groupName = groupName
      this.calendarGroups[index].selectedCalendars = selectedCalendars
    },
    clickOnPrepend(index) {
      this.calendarGroups.splice(index, 1)
    },
  },
  async mounted() {
    await this.getCalendars()
    await this.getSettings()
  },
}
</script>

<style lang="sass" scoped>
.settings--subsubheadline
  margin-top: 10px
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
