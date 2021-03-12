<template lang="pug">
.modal
  .modal__content
    span.pi.pi-times.modal__content--close(@click="clickOnCloseModal")
    .modal__content--categories
      h4 Create categories
      .modal__content--categories_input
        input(type="text" v-model="newCategory")
        button(@click="clickOnAddCategory") Add
      .modal__content--categories_buttons
        .modal__content--categories_buttons-button(
          v-for="category in categoriesModel.getCachedCategories()"
        )
          .modal__content--categories_buttons-button__content(v-if="!categoryEdit[category.id].status")
            p {{ category.name }}
            span.pi.pi-pencil(@click="clickOnCategoryEdit(category.id)")
          .modal__content--categories_buttons-button__content(v-else)
            input(type="text" v-model="categoryEdit[category.id].name")
            span.pi.pi-check(@click="clickOnCategorySave(category.id)")
            span.pi.pi-trash(@click="clickOnCategoryDelete(category.id)")
      button.modal__content--categories_save(@click="clickOnSaveCategories") Save
    .modal__content--table
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CategorySparse, CategoryEdit, SelectedCategories } from '@/interfaces'
import { backend } from '@/utils'
import { CalendarsModel, CategoriesModel } from '@/data-models'

export default defineComponent ({
  name: 'DashboardModal',
  data: () => ({
    categoryEdit: {} as CategoryEdit,
    newCategory: '',
    selectedCategories: {} as SelectedCategories,
    expandedRows: [],
    calendarsModel: new CalendarsModel,
    categoriesModel: new CategoriesModel
  }),
  props: {
    calendars: CalendarsModel,
    categories: CategoriesModel,
    userId: String
  },
  methods: {
    clickOnCloseModal(): void {
      this.$emit('clickClose')
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
      this.clickOnCloseModal()
    }
  },
  mounted() {
    if (typeof this.calendars !== 'undefined') {
      this.calendarsModel = this.calendars
    }
    if (typeof this.categories !== 'undefined') {
      this.categoriesModel = this.categories
    }
    this.categoriesModel.loadSavedCategoriesToCache()
    this.selectedCategories = this.categoriesModel.getSelectedCategories()
    this.categoryEdit = this.categoriesModel.getCategoryEdit()
  }
})
</script>

<style lang="sass">
.modal
  width: 100%
  height: 100%
  left: 0
  top:0
  position: fixed
  z-index: 1
  background-color: rgba(0, 0, 0, 0.3)

  &__content
    display: flex
    margin:
      top: 5%
      left: auto
      right: auto
    height: 80%
    width: 80%
    position: relative

    &--close
      position: absolute
      left: 1rem
      top: 1rem
      z-index: 2
      cursor: pointer

    &--categories
      flex: 1
      background-color: #FFD23F
      position: relative
      padding: 1%

      &_buttons
        &-button
          display: inline-block
          background-color: #C33C54
          border-radius: 2rem
          margin:
            top: 0.5rem
            bottom: 0.5rem
            right: 0.5rem

          &:hover
            background-color: #AC354B

          &__content
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

      &_input
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

      &_save
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
    &--table
      flex: 3
      overflow: scroll
      background-color: white

</style>
