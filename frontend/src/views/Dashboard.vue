<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(icon="pi pi-cog" @click="clickOnSettings")
  p-dialog(v-model:visible="modalVisible")
    h4 Assign each calendar to a category
    p-input-text(v-model="newCategory")
    p-button(@click="clickOnAddCategory") Add
    p(v-for="category in categoriesModel.getCachedCategoryNames()") {{ category }}
    p-data-table(
      :value="calendarsModel.getCalendars()"
    )
      p-column(field="calendarName" header="Name")
      p-column(header="Category")
        template(#body="slotProps")
          p-dropdown(v-model="selectedCategories[slotProps.data.calendarId]" :options="categoriesModel.getCachedCategoryNames()")
    p-button(@click="clickOnSaveCategories") Save

  time-table(
    :categoriesModel="categoriesModel"
  )
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { backend } from '@/utils'
import { SelectedCategories } from '@/interfaces'
import { CalendarsModel, CategoriesModel } from '@/data-models'
import TimeTable from '@/components/TimeTable.vue'

export default defineComponent ({
  data: () => ({
    modalVisible: true,
    calendarsModel: new CalendarsModel(),
    newCategory: '',
    selectedCategories: {} as SelectedCategories,
    categoriesModel: new CategoriesModel(),
    expandedRows: []
  }),
  components: {
    'time-table': TimeTable
  },
  methods: {
    clickOnAddCategory(): void {
      this.categoriesModel.addCategory(this.newCategory)
      this.newCategory = ''
    },
    clickOnSettings(): void {
      this.modalVisible = true
    },
    async clickOnSaveCategories(): Promise<void> {
      // clean categories
      this.categoriesModel.clearCategories()
      // save calendars to categories
      this.categoriesModel.addCategory('Not Assigned')
      const selectedCalendars: string[] = Object.keys(this.selectedCategories)
      this.calendarsModel.getCalendars().map(cal => {
        if (selectedCalendars.includes(cal.calendarId)) {
          // add calendar to category
          const categoryName: string = this.selectedCategories[cal.calendarId]
          this.categoriesModel.addCalendarToCategory(cal, categoryName)
        } else {
          // add calendar to not assigned
          this.categoriesModel.addCalendarToCategory(cal, 'Not Assigned')
        }
      })

      this.categoriesModel.calculateMetaData()
      const categoriesSparse = this.categoriesModel.getCategoriesSparse()
      // TODO: hardcoded user!
      const res = await backend.post('/save-categories', {
        userId: '123',
        categoriesSparse
      })
      console.log(res)
      this.modalVisible = false
    }
  },
  async mounted() {
    const { data: { events, categories } } = await backend.post('/', {
      userId: '123'
    })
    this.calendarsModel.updateRawCalendars(events)
    if (categories.length !== 0) {
      this.categoriesModel.updateCategoriesFromDatabase(categories, this.calendarsModel)
      this.selectedCategories = this.categoriesModel.getSelectedCategories()
      this.modalVisible = false
      console.log(this.categoriesModel.getCategoriesSparse())
    }
  }
})
</script>

<style lang="sass">
// Otherwise there is a weird box in the dropdown menu
.p-hidden-accessible
  display: none
</style>
