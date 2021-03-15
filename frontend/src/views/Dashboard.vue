<template lang="pug">
.root
  p-toast
  .navbar
    p.navbar__headline CALENDAR ANALYSER
    p-button.navbar__settings(icon="pi pi-cog" @click="openSettings")
    p.navbar__logout(@click="clickOnLogout") logout
  .overlay(v-if="!dataLoaded")
    p-spinner.overlay__spinner
  dashboard-modal(
    v-if="modalVisible"
    :calendarsModel="calendarsModel"
    :categoriesModel="categoriesModel"
    :userId="userId"
    @clickClose="clickOnCloseModal"
  )
  .dashboard
    .dashboard__chart
      .dashboard__chart--buttons
        p(@click="clickOnChartFilter('monday')") Since Monday
        p(@click="clickOnChartFilter('lastWeek')") Last week
      p-chart(
        type="pie"
        :data="chartData"
        :options="chartOptions"
        :height="30"
        :width="30"
      )
    time-table.dashboard__timetable(
      :categoriesModel="categoriesModel"
    )
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { backend, msToTime } from '@/utils'
import { CalendarsModel, CategoriesModel } from '@/data-models'
import TimeTable from '@/components/TimeTable.vue'
import DashboardModal from '@/components/DashboardModal.vue'

export default defineComponent({
  data: () => ({
    dataLoaded: false,
    userId: '' as string | string[],
    modalVisible: false,
    calendarsModel: new CalendarsModel() as CalendarsModel,
    categoriesModel: new CategoriesModel() as CategoriesModel,
    backgroundColors: [
      '#50FFB1',
      '#4FB286',
      '#3C896D',
      '#546D64',
      '#4D685A',
      '#8E3B46',
      '#E0777D',
      '#C16200',
      '#881600',
      '#4E0110'
    ],
    hoverBackgroundColors: [
      '#0AFF91',
      '#38805F',
      '#255544',
      '#35453F',
      '#2B3B33',
      '#56242B',
      '#D2373F',
      '#7A3D00',
      '#3D0A00',
      '#280109'
    ],
    chartFilter: 'monday'
  }),
  components: {
    'time-table': TimeTable,
    'dashboard-modal': DashboardModal
  },
  computed: {
    chartData() {
      const dataCategories: number[] = []
      const labelsCategories: string[] = []
      const backgroundColorCategories: string[] = []
      const hoverBackgroundColorCategories: string[] = []
      const dataCalendars: number[] = []
      const labelsCalendars: string[] = []
      this.categoriesModel.getCategories().map(({ id, name, calendars, ...category }, i) => {
        if (id === 0) return // skip not assigned
        calendars.map(({ calendarName, ...calendar }) => {
          let calendarDuration = calendar['durationSinceMonday']
          if (this.chartFilter === 'lastWeek') {
            calendarDuration = calendar['durationLastWeek']
          }
          dataCalendars.push(calendarDuration)
          labelsCalendars.push(calendarName)
        })
        let categoryDuration = category['durationSinceMonday']
        if (this.chartFilter === 'lastWeek') {
          categoryDuration = category['durationLastWeek']
        }
        dataCategories.push(categoryDuration)
        labelsCategories.push(name)
        backgroundColorCategories.push(this.backgroundColors[this.backgroundColors.length - 1 - i])
        backgroundColorCategories.push(this.hoverBackgroundColors[this.hoverBackgroundColors.length - 1 - i])
      })
      return {
        labels: [1, 2, 3, 4],
        datasets: [
          {
            data: dataCategories,
            labels: labelsCategories,
            backgroundColor: backgroundColorCategories,
            hoverBackgroundColor: hoverBackgroundColorCategories
          },
          {
            data: dataCalendars,
            labels: labelsCalendars
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem: any, data: any) {
              const dataset = data.datasets[tooltipItem.datasetIndex]
              const index = tooltipItem.index
              return dataset.labels[index] + ': ' + msToTime(dataset.data[index])
            }
          }
        }
      }
    }
  },
  methods: {
    openSettings(): void {
      this.modalVisible = true
    },
    clickOnChartFilter(mode: string): void {
      this.chartFilter = mode
    },
    clickOnCloseModal(): void {
      this.modalVisible = false
    },
    async clickOnLogout(): Promise<void> {
      await backend.get('/logout')
      this.$router.push({ name: 'Login' })
    }
  },
  async mounted() {
    try {
      this.userId = this.$route.params.userId
      // TODO: there must be a better method than this...
      let endpoint = '/'
      if (this.userId === '123') {
        endpoint = '/test'
      }
      const {
        data: { events, categories, userName }
      } = await backend.post(endpoint, {
        userId: this.userId
      })

      this.calendarsModel.updateRawCalendars(events)

      if (categories.length === 0) {
        // Set all calendars to not assigned
        this.categoriesModel.initialSetup(this.calendarsModel)
        this.openSettings()
      } else {
        this.categoriesModel.updateCategoriesFromDatabase(categories, this.calendarsModel)
        this.$toast.add({severity:'info', summary: `Hey ${userName || 'Stranger'},`, detail:'Welcome back!', life: 3000})
      }
      this.dataLoaded = true
    } catch (err) {
      this.$router.push({ name: 'Login' })
    }
  }
})
</script>

<style lang="sass">
.overlay
  position: fixed
  height: 100%
  width: 100%
  background-color: white
  top: 0
  z-index: 10

  &__spinner
    position: absolute
    top: 50%
    transform: translateY(-50%)

.navbar
  height: 4rem
  width: 100%
  background-color: #FFD23F
  box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.2)
  position: fixed
  left: 0
  top:0
  z-index: 11

  &__settings
    background-color: transparent
    border-color: transparent
    color: #444
    position: absolute
    right: 80px
    top: 50%
    transform: translateY(-50%)
    cursor: pointer
    &:hover
      color: #888 !important
      background-color: transparent !important
      border-color: transparent !important
    &:focus
      box-shadow: 0 0 0 0 transparent

  .pi
    font-size: 1.2rem

  &__logout
    position: absolute
    right: 20px
    top: 50%
    transform: translateY(-50%)
    cursor: pointer
    color: #444
    &:hover
      color: #888

  p
    margin: 0

  &__headline
    position: absolute
    left: 20px
    top: 2rem
    font-weight: 700
    transform: translateY(-50%)
    margin: 0

.dashboard
  display: flex
  margin-top: 6rem

  &__chart
    flex: 2
    margin:
      right: 2rem
      left: 2rem

    &--buttons
      display: flex
      justify-content: space-evenly
      margin-bottom: 1rem

      p
        cursor: pointer
        &:hover
          color: #888

  &__timetable
    flex: 4
</style>
