<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(icon="pi pi-cog" @click="clickOnSettings")
  p-dialog(v-model:visible="modalVisible")
    h4 Assign each calendar to a category
    p-input-text(v-model="newCategory")
    p-button(@click="clickOnAddCategory") Add
    p(v-for="category in categoriesModel.getCachedCategories()") {{ category.name }}
    p-data-table(
      :value="calendarsModel.getCalendars()"
    )
      p-column(field="calendarName" header="Name")
      p-column(header="Category")
        template(#body="slotProps")
          p-dropdown(
            v-model="selectedCategories[slotProps.data.calendarId]"
            :options="categoriesModel.getCachedCategories()"
            optionLabel="name"
          )
    p-button(@click="clickOnSaveCategories") Save

  time-table(
    :categoriesModel="categoriesModel"
  )
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { backend } from '@/utils'
import { SelectedCategories, CategorySparse } from '@/interfaces'
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
      if (!this.categoriesModel.addCategoryToCache(this.newCategory)) {
        alert('Something went wrong!')
      }
      this.newCategory = ''
    },
    clickOnSettings(): void {
      this.modalVisible = true
    },
    async clickOnSaveCategories(): Promise<void> {
      // clean categories
      this.categoriesModel.clearCategories()
      // save calendars to categories
      this.calendarsModel.getCalendars().map(cal => {
        const category: CategorySparse = this.selectedCategories[cal.calendarId]
        this.categoriesModel.addCalendarToCategory(cal, category)
      })

      this.categoriesModel.calculateMetaData()
      const categoriesSparse = this.categoriesModel.getCategoriesSparse()
      // TODO: hardcoded user!
      const res = await backend.post('/save-categories', {
        userId: '123',
        categoriesSparse
      })
      this.modalVisible = false
    }
  },
  async mounted() {
    const { data: { events, categories } } = await backend.post('/', {
      userId: '123'
    })
    this.calendarsModel.updateRawCalendars(events)

    if (categories.length === 0) {
      // Set all calendars to not assigned
      this.selectedCategories = this.categoriesModel.initialSetup(this.calendarsModel)
    } else {
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
