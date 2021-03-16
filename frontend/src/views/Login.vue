<template lang="pug">
.root
  .login__right
    h1 CALENDAR ANALYSER
  .login__middle
  button(@click="clickOnLogin") Login with Google
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Login',
  methods: {
    async clickOnLogin(): Promise<void> {
      window.location.href = `${process.env.VUE_APP_BACKEND_URL}/google`
    }
  },
  mounted() {
    console.log(process.env)
  }
})
</script>

<style lang="sass" scoped>
.root
  display: flex
  position: relative

.login
  &__right
    background-color: #FFD23F
    height: 100vh
    width: 40vw
    padding-left: 3rem
    display: flex

    h1
      font-size: 10rem
      z-index: 10

  &__middle
    background-color: #2196F3
    width: 10vw
    height: 100vh

button
  height: 3rem
  width: 15rem
  bottom: 3rem
  right: 2rem
  background-color: #C33C54
  border-color: transparent
  border-width: none
  border-radius: 2rem
  color: white
  font-size: 1.2rem
  position: absolute
  cursor: pointer
  box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.2)
  &:hover
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2)
    background-color: #AC354B
  &:focus
    outline: none
</style>
