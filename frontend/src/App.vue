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
        v-list-item(link)
          v-list-item-icon
            v-icon mdi-folder
          v-list-item-title My Files
        v-list-item(link)
          v-list-item-icon
            v-icon mdi-account-multiple
          v-list-item-title Shared with me
        v-list-item(link)
          v-list-item-icon
            v-icon mdi-star
          v-list-item-title Starred
      template(v-slot:append)
        div.pa-2
          router-link(:to="'/settings'")
            v-btn(block) Settings
    v-main
      v-container.px-4.py-0.fill-height(fluid)
        v-row.fill-height
            v-col
              transition(name="fade")
                router-view
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="sass" scoped>
.v-application
  font-family: 'Helvetica Neue'
</style>
