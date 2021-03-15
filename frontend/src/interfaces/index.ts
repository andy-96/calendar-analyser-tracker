export interface RawCalendar {
  calendarId: string
  calendarName: string
  accessRole: string
  backgroundColor: string
  events: EventSparse[]
}

export interface Calendar extends RawCalendar {
  totalDuration: number
  threeMonthAverage: number
  durationSinceMonday: number
  durationLastWeek: number
}

export interface EventSparse {
  id: string
  summary: string
  organizer: {
    id?: string
    email?: string
    displayName?: string
    self?: boolean
  },
  start: {
    dateTime: string
  }
  end: {
    dateTime: string
  }
  htmlLink: string
  duration: number
}

export interface CategorySparse {
  id: number
  name: string
  orderId: number
}

export interface Category extends CategorySparse {
  calendars: Calendar[]
}

export interface CategoryMeta extends Category {
  totalDuration: number
  threeMonthAverage: number
  durationSinceMonday: number
  durationLastWeek: number
}

export interface FirebaseCategory extends CategorySparse {
  calendars: string[]
}

export interface SelectedCategories {
  [key: string]: CategorySparse
}

export interface CategoryEdit {
  [key: string]: {
    status: boolean
    name: string
  }
}