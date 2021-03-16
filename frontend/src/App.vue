<template lang="pug">
router-view
</template>

<style lang="sass">
@import './../node_modules/primevue/resources/themes/saga-blue/theme.css'
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin: -8px

#nav
  padding: 30px

#nav a
  font-weight: bold
  color: #2c3e50

#nav a.router-link-exact-active
  color: #42b983

// Otherwise there is a weird box in the dropdown menu
.p-hidden-accessible
  display: none

.small
  font-size: 0.7rem
</style>
