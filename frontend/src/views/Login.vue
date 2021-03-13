<template lang="pug">
p-button(@click="clickOnLogin") Login
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