<template lang="pug">
.root
  .login__right
    h1 NOT FOUND
    h3 Redirecting to Login...
  .login__middle
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFound',
  mounted() {
    setTimeout(() => this.$router.push({ name: 'Login' }), 3000)
  }
})
</script>

<style lang="sass" scoped>
.root
  display: flex

.login
  position: relative

  &__right
    background-color: #FFD23F
    height: 100vh
    width: 40vw
    padding-left: 3rem
    position: relative

    h1
      position: absolute
      font-size: 10rem
      z-index: 100
      width: 70vw

    h3
      position: absolute
      z-index: 10
      top: 30%
      margin-left: 2rem

  &__middle
    background-color: #2196F3
    width: 10vw
    height: 100vh

  &__button
    position: absolute
    bottom: 3rem
    right: 2rem

    button
      height: 3rem
      width: 15rem
      background-color: #C33C54
      border-color: transparent
      border-width: none
      border-radius: 2rem
      color: white
      font-size: 1.2rem
      cursor: pointer
      box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.2)
      &:hover
        box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2)
        background-color: #AC354B
      &:focus
        outline: none
</style>
