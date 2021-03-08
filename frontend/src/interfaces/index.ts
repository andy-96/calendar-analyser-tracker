export interface CalendarSparse {
  id: string
  summary: string
  accessRole: string
  backgroundColor: string
}

export interface EventByCalendar {
  calendarId: string
  calendarName: string
  events: EventSparse[]
  duration?: string
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