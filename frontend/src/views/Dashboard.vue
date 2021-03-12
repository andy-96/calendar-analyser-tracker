<template lang="pug">
.home
  <!-- add pie chart here! -->
  p-button(icon="pi pi-cog" @click="openSettings")
  .dashboard__modal(v-if="modalVisible")
    .dashboard__modal--content
      span.pi.pi-times.dashboard__modal--content_close(@click="clickOnCloseModal")
      .dashboard__modal--content_categories
        h4 Create categories
        .dashboard__modal--content_categories__input
          input(type="text" v-model="newCategory")
          button(@click="clickOnAddCategory") Add
        .dashboard__modal--content_categories-buttons
          .dashboard__modal--content_categories-buttons__button(
            v-for="category in categoriesModel.getCachedCategories()"
            v-if="dataLoaded"
          )
            .dashboard__modal--content_categories-buttons__button--content(v-if="!categoryEdit[category.id].status")
              p {{ category.name }}
              span.pi.pi-pencil(@click="clickOnCategoryEdit(category.id)")
            .dashboard__modal--content_categories-buttons__button--content(v-else)
              input(type="text" v-model="categoryEdit[category.id].name")
              span.pi.pi-check(@click="clickOnCategorySave(category.id)")
              span.pi.pi-trash(@click="clickOnCategoryDelete(category.id)")
        button.dashboard__modal--content_categories__save(@click="clickOnSaveCategories") Save
      .dashboard__modal--content_table
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
    userId: '' as string | string[],
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
    clickOnCloseModal(): void {
      this.modalVisible = false
    },
    clickOnCategoryEdit(id: number): void {
      this.categoryEdit[id].status = true
    },
    clickOnCategorySave(id: number): void {
      if (!this.categoriesModel.renameCategoryFromCache(id, this.categoryEdit[id])) {
        alert("Category shouldn't be empty!")
      }
      const selectedCalendars = Object.keys(this.selectedCategories)
      selectedCalendars.map(calId => {
        if (this.selectedCategories[calId].id === id) {
          this.selectedCategories[calId].name = this.categoryEdit[id].name
        }
      })
      this.categoryEdit[id].status = false
    },
    clickOnCategoryDelete(id: number): void {
      this.categoriesModel.removeCategoryFromCache(id)
      const selectedCalendars = Object.keys(this.selectedCategories)
      selectedCalendars.map(calId => {
        if (this.selectedCategories[calId].id === id) {
          this.selectedCategories[calId] = this.categoriesModel.getNotAssignedCategory()
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
    openSettings(): void {
      this.categoriesModel.loadSavedCategoriesToCache()
      this.selectedCategories = this.categoriesModel.getSelectedCategories()
      this.categoryEdit = this.categoriesModel.getCategoryEdit()
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
      await backend.post('/save-categories', {
        userId: this.userId,
        categoriesSparse
      })
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
// Otherwise there is a weird box in the dropdown menu
.p-hidden-accessible
  display: none

.dashboard
  &__modal
    width: 100%
    height: 100%
    left: 0
    top:0
    position: fixed
    z-index: 1
    background-color: rgba(0, 0, 0, 0.3)

    &--content
      display: flex
      margin:
        top: 5%
        left: auto
        right: auto
      height: 80%
      width: 80%
      position: relative

      &_close
        position: absolute
        left: 1rem
        top: 1rem
        z-index: 2
        cursor: pointer

      &_categories
        flex: 1
        background-color: #FFD23F
        position: relative
        padding: 1%

        &-buttons
          &__button
            display: inline-block
            background-color: #C33C54
            border-radius: 2rem
            margin:
              top: 0.5rem
              bottom: 0.5rem
              right: 0.5rem

            &:hover
              background-color: #AC354B

            &--content
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
                margin-left: 0.3rem
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

        &__input
          input
            height: 2rem
            padding: 0.5rem
            border:
              radius: 8px 0px 0px 8px
              color: transparent
              width: 1px
            margin-bottom: 0.5rem
            &:focus
              outline: none

          button
            height: 2rem
            padding: 0.5rem
            background-color: #999
            color: white
            cursor: pointer
            border:
              radius: 0px 8px 8px 0px
              color: transparent
              width: 1px
            &:hover
              background-color: #777

        &__save
          position: absolute
          height: 2rem
          padding: 0.5rem
          width: 80%
          background-color: #B88D00
          color: white
          cursor: pointer
          bottom: 2rem
          left: 10%
          border:
            radius: 8px
            color: transparent
            width: 1px
          &:hover
            background-color: #8F6D00
          &:focus
            outline: none
          

      &_table
        flex: 3
        overflow: scroll
        background-color: white
</style>
