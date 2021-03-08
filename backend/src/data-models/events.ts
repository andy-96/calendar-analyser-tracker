import { EventByCalendar, EventSparse, GoogleEvent } from "@/interfaces"
import { Logger } from "@nestjs/common"
import { CalendarModel } from "./calendars"

export class EventsModel {
  private allEvents: GoogleEvent[]
  private calendars: CalendarModel
  private events: EventByCalendar[]
  private startTime: Date
  private endTime: Date
  private readonly logger = new Logger('EventsModel')

  // response of calendar fetch has weird type (GaxiosResponse<calendar_v3.Schema$CalendarList>)
  updateEvents(eventByCalendar: EventByCalendar[], startTime: Date, endTime: Date): void {
    this.startTime = startTime
    this.endTime = endTime
    this.events = eventByCalendar.map(({ events, ...calendarInfo }) => {
      const eventsWithDuration = events.map(({ start, end, ...events }) => {
        const duration = Number(new Date(end.dateTime)) - Number(new Date(start.dateTime))
        return {
          duration,
          start,
          end,
          ...events
        }
      })
      return {
        ...calendarInfo,
        events: eventsWithDuration
      }
    })

    const rawEventsflatten = []
    eventByCalendar.map(event => rawEventsflatten.push(...event.events))
    this.logger.log(`Fetched ${rawEventsflatten.length} events`)
    this.allEvents = rawEventsflatten
  }

  updateCalendarModel(calendars: CalendarModel): void {
    this.calendars = calendars
  }

  getAllEvents(): GoogleEvent[] {
    return this.allEvents
  }

  getEventsByCalendarSparse(): EventByCalendar[] {
    return this.events.map(({ events, ...calendarInfo }) => {
      const eventsSparse: EventSparse[] = events.map(({ id, summary, organizer, start, end, htmlLink, duration }) => {
        return {
          id, summary, organizer, start, end, htmlLink, duration
        }
      })
      return {
        ...calendarInfo,
        events: eventsSparse
      }
    })
  }
}