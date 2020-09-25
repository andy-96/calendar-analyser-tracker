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
    h1 COoo
    Calendar
</template>

<script>
import Calendar from './components/Calendar.vue'

export default {
  name: 'App',
  components: {
    Calendar,
  },
}
</script>

<style lang="sass" scoped></style>
