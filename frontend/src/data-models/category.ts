import { Calendar, Category, CategorySparse, SelectedCategories } from '@/interfaces'
import { msToTime } from '@/utils'
import { CalendarsModel } from '.'

export class CategoriesModel {
  private categories: Category[] = []
  private categoryList: string[] = []

  updateCategoriesFromDatabase(categories: CategorySparse[], calendarsModel: CalendarsModel): void {
    this.categories = categories.map(({ calendars: calendarIds, ...category }) => {
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
    this.categoryList = this.getSavedCategoryNames()
    console.log(this.categoryList)
    this.calculateMetaData()
  }

  addCategory(name: string): void {
    this.categoryList.push(name)
  }

  addCalendarToCategory(calendar: Calendar, categoryName: string): void {
    if (!this.getSavedCategoryNames().includes(categoryName)) {
      this.categories.push({
        name: categoryName,
        calendars: []
      })
    }
    const index = this.categories.findIndex(({ name }) => categoryName === name)
    this.categories[index].calendars.push(calendar)
  }

  clearCategories(): void {
    this.categories = []
  }

  calculateMetaData(): void {
    // calculate the meta data
    this.categories = this.categories.map(({ calendars, ...category }) => {
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

  getSavedCategoryNames(): string[] {
    return this.categories.map(({ name }) => name)
  }

  getCachedCategoryNames(): string[] {
    return this.categoryList
  }

  getCategories(): Category[] {
    return this.categories
  }

  getCategoriesSparse(): CategorySparse[] {
    return this.categories.map(({ calendars, name }) => {
      const calendarSparse = calendars.map(({ calendarId }) => calendarId)
      return {
        calendars: calendarSparse,
        name
      }
    })
  }

  getSelectedCategories(): SelectedCategories {
    const selectedCategories: SelectedCategories = {}
    this.categories.map(({ name, calendars }) => {
      calendars.map(({ calendarId }) => {
        selectedCategories[calendarId] = name
      })
    })
    return selectedCategories
  }
}