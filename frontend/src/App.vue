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
    router-view
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="sass" scoped></style>
