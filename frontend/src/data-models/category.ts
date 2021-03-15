import {
  Calendar,
  CategoryEdit,
  CategoryMeta,
  CategorySparse,
  FirebaseCategory,
  SelectedCategories
} from '@/interfaces'
import { CalendarsModel } from '.'

export class CategoriesModel {
  private savedCategories: CategoryMeta[] = []
  private cachedCategories: CategorySparse[] = []
  private categoryId = 1
  private notAssignedCategory: CategorySparse = {
    id: 0,
    orderId: 0,
    name: 'Not Assigned'
  }

  initialSetup(calendarsModel: CalendarsModel) {
    // Push every calendar to not assigned
    calendarsModel.getCalendars().map(calendar => {
      this.addCalendarToCategory(calendar, this.notAssignedCategory)
    })
    this.calculateMetaData()
  }

  loadSavedCategoriesToCache() {
    this.cachedCategories = this.savedCategories.map(({ id, name, orderId }) => {
      return { id, name, orderId }
    })
  }

  updateCategoriesFromDatabase(categories: FirebaseCategory[], calendarsModel: CalendarsModel): void {
    this.savedCategories = categories
      .map(({ calendars: calendarIds, ...category }) => {
        const calendars: Calendar[] = []
        let durationSinceMonday = 0
        let threeMonthAverage = 0
        let totalDuration = 0
        let durationLastWeek = 0
        if (typeof calendarIds !== 'undefined') {
          calendarIds.map(calId => {
            const calendar = calendarsModel.getCalendars().find(({ calendarId }) => calendarId === calId)
            if (typeof calendar !== 'undefined') {
              calendars.push(calendar)
              durationSinceMonday += calendar.durationSinceMonday
              threeMonthAverage += calendar.threeMonthAverage
              totalDuration += calendar.totalDuration
              durationLastWeek += calendar.durationLastWeek
            }
          })
        }
        return {
          calendars,
          ...category,
          durationSinceMonday,
          threeMonthAverage,
          totalDuration,
          durationLastWeek
        }
      })
      .sort((a, b) => b.orderId - a.orderId)
    // Reset categoryId to highest id while ommitting not available one
    this.categoryId =
      Math.max(
        ...this.savedCategories.map(({ id }) => {
          if (id === this.notAssignedCategory.id) {
            return 0
          }
          return id
        })
      ) + 1
  }

  addCategoryToCache(name: string): boolean {
    if (
      name === '' ||
      this.getCachedCategories()
        .map(({ name }) => name)
        .includes(name)
    ) {
      return false
    }
    this.cachedCategories.push({
      id: this.categoryId,
      name,
      orderId: this.categoryId
    })
    this.categoryId += 1
    return true
  }

  renameCategoryFromCache(catId: number, newCategory: { status: boolean; name: string }): boolean {
    if (newCategory.name === '') {
      return false
    }
    this.cachedCategories = this.cachedCategories.map(({ name, id, orderId }) => {
      if (id === catId) {
        return {
          name: newCategory.name,
          id,
          orderId
        }
      }
      return { name, id, orderId }
    })
    return true
  }

  removeCategoryFromCache(catId: number): void {
    const index = this.cachedCategories.findIndex(({ id }) => catId === id)
    this.cachedCategories.splice(index, 1)
  }

  addCalendarToCategory(calendar: Calendar, category: CategorySparse): void {
    // create new object if category is not available
    if (
      !this.getSavedCategories()
        .map(({ name }) => name)
        .includes(category.name)
    ) {
      this.savedCategories.push({
        ...category,
        calendars: [],
        durationSinceMonday: 0,
        threeMonthAverage: 0,
        totalDuration: 0,
        durationLastWeek: 0
      })
    }
    const index = this.savedCategories.findIndex(({ id }) => category.id === id)
    this.savedCategories[index].calendars.push(calendar)
  }

  clearCategories(): void {
    this.savedCategories = []
  }

  calculateMetaData(): void {
    // calculate the meta data
    this.savedCategories = this.savedCategories.map(({ calendars, ...category }) => {
      let durationSinceMonday = 0
      let threeMonthAverage = 0
      let totalDuration = 0
      let durationLastWeek = 0
      calendars.map(
        ({
          durationSinceMonday: durMonday,
          threeMonthAverage: threeMonth,
          totalDuration: totalDur,
          durationLastWeek: durLastWeek
        }) => {
          durationSinceMonday += durMonday
          threeMonthAverage += threeMonth
          totalDuration += totalDur
          durationLastWeek += durLastWeek
        }
      )
      return {
        ...category,
        calendars,
        durationSinceMonday,
        threeMonthAverage,
        totalDuration,
        durationLastWeek
      }
    })
  }

  getCategoryEdit(): CategoryEdit {
    const categoryEdit: CategoryEdit = {}
    this.getCachedCategories().map(({ id, name }) => {
      categoryEdit[id] = {
        status: false,
        name
      }
    })
    return categoryEdit
  }

  getSelectedCategories(): SelectedCategories {
    const selectedCategories: SelectedCategories = {}
    this.savedCategories.map(({ calendars, id, name, orderId }) => {
      calendars.map(({ calendarId }) => {
        selectedCategories[calendarId] = { id, name, orderId }
      })
    })
    return selectedCategories
  }

  private getSavedCategories(): CategorySparse[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return this.savedCategories.map(({ calendars, ...savedCategories }) => {
      return {
        ...savedCategories
      }
    })
  }

  getCachedCategories(): CategorySparse[] {
    return this.cachedCategories.sort((a, b) => b.orderId - a.orderId)
  }

  getCategories(): CategoryMeta[] {
    return this.savedCategories.sort((a, b) => b.orderId - a.orderId)
  }

  getCategoriesSparse(): FirebaseCategory[] {
    return this.savedCategories.map(({ calendars, ...savedCategories }) => {
      const calendarSparse = calendars.map(({ calendarId }) => calendarId)
      return {
        calendars: calendarSparse,
        ...savedCategories
      }
    })
  }

  getNotAssignedCategory(): CategorySparse {
    return this.notAssignedCategory
  }
}
