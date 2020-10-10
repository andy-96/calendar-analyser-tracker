<template lang="pug">
  v-app
    v-navigation-drawer(app floating color='#6069D3' dark)
      v-list-item.px-2(@click='toggleMini = !toggleMini')
        v-list-item-avatar
          v-icon mdi-account-outline
        v-list-item-content.text-truncate Andy Chen 
        v-btn(icon='' small='')
          v-icon mdi-chevron-left
      v-divider
      v-list(nav dense)
        v-list-item(:to="'/analytics'")
            v-list-item-icon
              v-icon mdi-folder
            v-list-item-title Analytics
        v-list-item(:to="'/calendar'")
          v-list-item-icon
            v-icon mdi-account-multiple
          v-list-item-title Calendar
      template(v-slot:append)
        div.pa-2
          router-link(:to="'/settings'")
            v-btn(block tile) Settings
        div.pa-2
          v-btn(block tile @click="onClickLogout") Log Out
    v-main
      v-container.px-4.py-0.fill-height(fluid)
        v-row.fill-height
            v-col
              transition(name="fade")
                router-view
</template>

<script>
import { mongodb } from './utils/index'

export default {
  name: 'App',
  methods: {
    async onClickLogout() {
      const {
        data: { msg },
      } = await mongodb.get('/auth/logout')
      console.log(msg)
    },
  },
}
</script>

<style lang="sass" scoped>
.v-application
  font-family: 'Helvetica Neue'
</style>
