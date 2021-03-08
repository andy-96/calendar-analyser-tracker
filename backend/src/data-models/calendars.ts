import { GoogleCalendarListEntry, CalendarSparse } from "@/interfaces"

export class CalendarModel {
  private calendars: GoogleCalendarListEntry[]

  // response of calendar fetch has weird type (GaxiosResponse<calendar_v3.Schema$CalendarList>)
  updateCalendars(calendars: GoogleCalendarListEntry[]): void {
    this.calendars = calendars
  }

  getCalendars(): GoogleCalendarListEntry[] {
    return this.calendars
  }

  getCalendarIdsNames(): { calendarId: string, calendarName: string }[] {
    return this.calendars.map(({ id, summary }) => { return { calendarId: id, calendarName: summary }})
  }

  getCalendarsSparse(): CalendarSparse[] {
    return this.calendars.map(({ id, summary, accessRole, backgroundColor }) => {
      return {
        id, summary, accessRole, backgroundColor
      }
    })
  }
}