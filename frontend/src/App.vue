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
    v-main
      v-sheet(height="80vh")
        v-calendar.calendar(
          ref="calendar"
          :now="convertTime(Date.now())"
          :value="convertTime(Date.now())"
          :events="events"
          color="primary"
          type="week"
        )
</template>

<script>
import { mongodb } from "./utils/index";

export default {
  name: "App",
  data: () => ({
    events: [
      {
        name: "Weekly Meeting",
        start: "2020-09-21 9:0",
        end: "2020-09-21 10:0",
      },
    ],
  }),
  computed: {},
  methods: {
    convertTime(dateTimeRaw) {
      try {
        const dateTime = new Date(dateTimeRaw);
        const year = dateTime.getFullYear();
        const month = dateTime.getMonth() + 1;
        const date = dateTime.getDate();
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        return `${year}-${month}-${date} ${hours}:${minutes}`;
      } catch (err) {
        console.log(dateTimeRaw);
      }
    },
    async getEvents() {
      const { data } = await mongodb.get("/events");
      this.events = data.map((event) => {
        let start = event.start.dateTime;
        let end = event.end.dateTime;
        if (typeof event.start.dateTime === "undefined") {
          start = event.start.date;
          end = event.end.date;
        }
        return {
          name: event.summary,
          start: this.convertTime(start),
          end: this.convertTime(end),
        };
      });
    },
  },
  mounted() {
    this.getEvents();
  },
};
</script>

<style lang="sass" scoped>
calendar
  margin-top: 100px
</style>
