export interface RawCalendar {
  calendarId: string
  calendarName: string
  accessRole: string
  backgroundColor: string
  events: EventSparse[]
}

export interface Calendar extends RawCalendar {
  totalDuration: number
  totalDurationString: string
  threeMonthAverage: number
  threeMonthAverageString: string
  durationSinceMonday: number
  durationSinceMondayString: string
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

export interface Category {
  name: string
  calendars: Calendar[]
}

export interface SelectedCategories {
  [key: string]: string
}

export interface CategorySparse {
  name: string
  calendars: string[]
}