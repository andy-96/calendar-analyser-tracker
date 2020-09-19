<template lang="pug">
.calendar
  .cal-side-hours
    .cal-side-hour
    .cal-side-hour
      p 08:00
    .cal-side-hour
      p 08:00
  .cal-header-days
    .cal-header-day(v-for="(day, index) in getThisWeek" :key="index")
      p
        span.cal-header-day-number {{ day.dayNumber }}
        |  {{ day.dayName }}

</template>

<script>
export default {
  name: "HelloWorld",
  computed: {
    getThisWeek() {
      const today = new Date();
      const day = today.getDay() === 0 ? 7 : today.getDay();
      const monday = new Date(today.setDate(today.getDate() - day + 1));
      const dayNames = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const thisWeekDays = dayNames.map((day, index) => {
        return {
          dayName: day,
          dayNumber: monday.getDate() + index,
        };
      });
      return thisWeekDays;
    },
  },
  mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="sass" scoped>
.calendar
  display: flex

  .cal-side-hours
    flex: 1
    background-color: black
    width: 50px
    height: calc(100vh - 70px)

    .cal-side-hour
      height: 50px

  .cal-header-days
    flex: 7
    display: flex

    .cal-header-day
      align-items: center
      justify-content: center
      flex: 1
      height: 50px

      .cal-header-day-number
        font-weight: 1000
</style>
