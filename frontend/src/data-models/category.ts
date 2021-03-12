import { Calendar, Category, CategoryEdit, CategorySparse, FirebaseCategory, SelectedCategories } from '@/interfaces'
import { msToTime } from '@/utils'
import { CalendarsModel } from '.'

export class CategoriesModel {
  private savedCategories: Category[] = []
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
      return {
        id, name, orderId
      }
    })
  }

  updateCategoriesFromDatabase(categories: FirebaseCategory[], calendarsModel: CalendarsModel): void {
    this.savedCategories = categories.map(({ calendars: calendarIds, ...category }) => {
      const calendars: Calendar[] = []
      calendarIds.map(calId => {
        const calendar = calendarsModel.getCalendars().find(({ calendarId }) => calendarId === calId)
        if (typeof calendar !== 'undefined') {
          calendars.push(calendar)
        }
      })
      return {
        calendars,
        ...category
      }
    })
      .sort((a, b) => b.orderId - a.orderId)
    this.cachedCategories = this.getSavedCategories()
    // Reset categoryId to highest id while ommitting not available one
    this.categoryId = Math.max(...this.cachedCategories.map(({ id }) => {
      if (id === this.notAssignedCategory.id) {
        return 0
      }
      return id
    }))
    this.calculateMetaData()
  }

  addCategoryToCache(name: string): boolean {
    if (name === ''  || this.getCachedCategories().map(({ name }) => name).includes(name)) {
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

  renameCategoryFromCache(catId: number, newCategory: { status: boolean, name: string }): boolean {
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
        calendars: []
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
      calendars.map(
        ({
          durationSinceMonday: durMonday,
          threeMonthAverage: threeMonth,
          totalDuration: totalDur
        }) => {
          durationSinceMonday += durMonday
          threeMonthAverage += threeMonth
          totalDuration += totalDur
        }
      )
      const threeMonthAverageString = msToTime(threeMonthAverage)
      const totalDurationString = msToTime(totalDuration)
      const durationSinceMondayString = msToTime(durationSinceMonday)
      return {
        ...category,
        calendars,
        durationSinceMonday,
        durationSinceMondayString,
        threeMonthAverage,
        threeMonthAverageString,
        totalDuration,
        totalDurationString
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
        selectedCategories[calendarId] = {
          id, name, orderId
        }
      })
    })
    return selectedCategories
  }

  private getSavedCategories(): CategorySparse[] {
    return this.savedCategories.map(({ calendars, ...savedCategories }) => {
      return {
        ...savedCategories
      }
    })
  }

  getCachedCategories(): CategorySparse[] {
    return this.cachedCategories.sort((a, b) => b.orderId - a.orderId)
  }

  getCategories(): Category[] {
    return this.savedCategories.sort((a, b) => b.orderId - a.orderId)
  }

  getCategoriesSparse(): FirebaseCategory[] {
    return this.savedCategories.map(({ calendars, ...savedCategories }) => {
      const calendarSparse = calendars.map(({ calendarId }) => calendarId)
      return {
        calendars: calendarSparse,
        ...savedCategories,
      }
    })
  }

  getNotAssignedCategory(): CategorySparse {
    return this.notAssignedCategory
  }
}