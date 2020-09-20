<template lang="pug">
v-app
  v-row
    v-col
      v-sheet(height="80vh")
        v-calendar(
          ref="calendar"
          :now="today"
          :value="today"
          :events="events"
          color="primary"
          type="week"
        )
  v-footer(
    :inset="footer.inset"
    app
  )
    span.px-4 &copy; {{ new Date().getFullYear() }}
</template>

<script>
export default {
  name: "landingPage",
  data: () => ({
    today: new Date(),
    events: [],
  }),
};
</script>
