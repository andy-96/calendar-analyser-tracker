<template lang="pug">
div
  google-login(:params="params" :renderParams="renderParams" :onSuccess="onSuccess" :onFailure="onFailure") Login
  
</template>

<script>
import { GoogleLogin } from 'vue-google-login'
import dotenv from 'dotenv'

dotenv.config()

const { VUE_APP_CLIENT_ID } = process.env

export default {
  name: 'Login',
  components: {
    'google-login': GoogleLogin,
  },
  data: () => ({
    params: {
      client_id: VUE_APP_CLIENT_ID,
    },
    renderParams: {
      width: 250,
      height: 50,
      longtitle: true,
    },
  }),
  methods: {
    onSuccess(googleUser) {
      console.log(googleUser)
      // This only gets the user information: id, name, imageUrl and email
      console.log(googleUser.getBasicProfile())
    },
    onFailure() {
      alert('U suck!')
    },
  },
}
</script>

<style></style>
