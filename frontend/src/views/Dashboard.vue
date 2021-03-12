<template lang="pug">
.root
  .navbar
    p.navbar__headline CALENDAR ANALYSER
    p-button.navbar__settings(icon="pi pi-cog" @click="openSettings")
  dashboard-modal(
    :calendars="calendarsModel"
    :categories="categoriesModel"
    :userId="userId"
    v-if="modalVisible"
    @clickClose="clickOnCloseModal"
  )
  .dashboard
    p-chart.dashboard__chart(
      type="pie"
      :data="chartData"
      :options="chartOptions"
      height="30"
      width="30"
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

export default defineComponent ({
  data: () => ({
    dataLoaded: false,
    userId: '' as string | string[],
    modalVisible: true,
    calendarsModel: new CalendarsModel() as CalendarsModel,
    categoriesModel: new CategoriesModel() as CategoriesModel,
    backgroundColors: ['#50FFB1', '#4FB286', '#3C896D', '#546D64', '#4D685A', '#8E3B46', '#E0777D', '#C16200', '#881600', '#4E0110'],
    hoverBackgroundColors: ['#0AFF91', '#38805F', '#255544', '#35453F', '#2B3B33', '#56242B', '#D2373F', '#7A3D00', '#3D0A00', '#280109']
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
      this.categoriesModel.getCategories().map(({ id, name, durationSinceMonday, calendars }, i) => {
        if (id === 0) return // skip not assigned
        calendars.map(({ calendarName, durationSinceMonday }, i) => {
          dataCalendars.push(durationSinceMonday)
          labelsCalendars.push(calendarName)
        })
        dataCategories.push(durationSinceMonday)
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
            labels: labelsCalendars,
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        legend: {
          display: false,
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
    clickOnCloseModal(): void {
      this.modalVisible = false
    }
  },
  async mounted() {
    this.userId = this.$route.params.userId
    const { data: { events, categories } } = await backend.post('/', {
      userId: this.userId
    })
    this.calendarsModel.updateRawCalendars(events)

    if (categories.length === 0) {
      // Set all calendars to not assigned
      this.categoriesModel.initialSetup(this.calendarsModel)
      this.openSettings()
    } else {
      this.categoriesModel.updateCategoriesFromDatabase(categories, this.calendarsModel)
      this.modalVisible = false
    }
    this.dataLoaded = true
  }
})
</script>

<style lang="sass">
.navbar
  height: 4rem
  width: 100%
  background-color: #FFD23F
  box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.2)
  position: fixed
  left: 0
  top:0
  z-index: 1

  &__settings
    background-color: transparent
    border-color: transparent
    color: #444
    position: absolute
    right: 20px
    top: 50%
    transform: translateY(-50%)
    &:hover
      color: #888 !important
      background-color: transparent !important
      border-color: transparent !important
    &:focus
      box-shadow: 0 0 0 0 transparent
  
  .pi
    font-size: 1.2rem
  
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

  &__timetable
    flex: 4
</style>
