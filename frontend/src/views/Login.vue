<template lang="pug">
  v-row.fill-height
    v-btn(
      @click="login"
    ) Click me
</template>

<script>
import { mongodb } from '../utils/index'

export default {
  name: 'Login',
  methods: {
    async login() {
      const { wc } = await this.$gAuth.signIn()
      await mongodb.post('/auth', {
        token: wc,
      })
    },
  },
}
</script>

<style></style>
