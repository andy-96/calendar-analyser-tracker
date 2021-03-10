import { calendar_v3 } from 'googleapis'

export interface GoogleCalendarListEntry extends calendar_v3.Schema$CalendarListEntry {}
export interface GoogleCalendar extends calendar_v3.Calendar {}
export interface GoogleCalendarList extends calendar_v3.Schema$CalendarList {}

export interface CalendarSparse {
  id: string
  summary: string
  accessRole: string
  backgroundColor: string
}

export interface CalendarsEventsReponse {
  calendars: CalendarSparse[]
  events: EventByCalendar[]
}

export interface GoogleEventList extends calendar_v3.Schema$Events {}
export interface GoogleEvent extends calendar_v3.Schema$Event {
  duration?: number
}

export interface EventByCalendar {
  calendarId: string
  calendarName: string
  events: GoogleEvent[] | EventSparse[]
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
  start: calendar_v3.Schema$EventDateTime
  end: calendar_v3.Schema$EventDateTime
  htmlLink: string
}