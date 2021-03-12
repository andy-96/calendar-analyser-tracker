<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(icon="pi pi-cog" @click="clickOnSettings")
  p-dialog.dashboard__modal(v-model:visible="modalVisible")
    h4 Assign each calendar to a category
    p-input-text(v-model="newCategory")
    p-button(@click="clickOnAddCategory") Add
    .dashboard__modal--categories
      .dashboard__modal--categories_button(
        v-for="category in categoriesModel.getCachedCategories()"
        v-if="dataLoaded"
      )
        .dashboard__modal--categories_button-content(v-if="!categoryEdit[category.id].status")
          p {{ category.name }}
          span.pi.pi-pencil(@click="clickOnCategoryEdit(category.id)")
        .dashboard__modal--categories_button-content(v-else)
          input(type="text" v-model="categoryEdit[category.id].name")
          span.pi.pi-check(@click="clickOnCategorySave(category.id)")
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
import { SelectedCategories, CategorySparse, CategoryEdit } from '@/interfaces'
import { CalendarsModel, CategoriesModel } from '@/data-models'
import TimeTable from '@/components/TimeTable.vue'

export default defineComponent ({
  data: () => ({
    dataLoaded: false,
    modalVisible: true,
    categoryEdit: {} as CategoryEdit,
    calendarsModel: new CalendarsModel(),
    newCategory: '',
    selectedCategories: {} as SelectedCategories,
    categoriesModel: new CategoriesModel(),
    expandedRows: [],
  }),
  components: {
    'time-table': TimeTable
  },
  methods: {
    clickOnCategoryEdit(id: number): void {
      this.categoryEdit[id].status = true
    },
    clickOnCategorySave(id: number): void {
      this.categoriesModel.renameCategory(id, this.categoryEdit[id])
      const selectedCalendars = Object.keys(this.selectedCategories)
      selectedCalendars.map(calId => {
        if (this.selectedCategories[calId].id === id) {
          this.selectedCategories[calId].name = this.categoryEdit[id].name
        }
      })
      this.categoryEdit[id].status = false
    },
    clickOnAddCategory(): void {
      if (!this.categoriesModel.addCategoryToCache(this.newCategory)) {
        alert('Something went wrong!')
      }
      this.categoryEdit = this.categoriesModel.getCategoryEdit()
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
    }
    this.categoryEdit = this.categoriesModel.getCategoryEdit()
    this.dataLoaded = true
  }
})
</script>

<style lang="sass">
// Otherwise there is a weird box in the dropdown menu
.p-hidden-accessible
  display: none

.dashboard
  &__modal
    width: 80%

    &--categories
      &_button
        display: inline-block
        background-color: #C33C54
        border-radius: 2rem
        margin:
          top: 0.5rem
          bottom: 0.5rem
          right: 0.5rem

        &:hover
          background-color: #AC354B

        &-content
          display: flex
          margin: 0.3rem 0.5rem 0.3rem 0.5rem
          height: 1rem

          p
            font-size: 0.7rem
            margin: 0
            color: white

          span
            font-size: 0.7rem
            color: white
            margin-left: 0.2rem
            margin-top: 0.15rem
            cursor: pointer

          input
            height: 1rem
            width: 5rem
            font-size: 0.7rem
            border-color: transparent
            background-color: #AC354B
            color: white
            &:focus
              outline: none !important
</style>
