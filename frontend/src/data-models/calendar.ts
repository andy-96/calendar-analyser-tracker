import { Calendar, RawCalendar } from "@/interfaces"
import { msToTime } from '@/utils'

export class CalendarsModel {
  private rawCalendars: RawCalendar[] = []
  private calendars: Calendar[] = []

  updateRawCalendars(rawCalendars: RawCalendar[]): void {
    this.rawCalendars = rawCalendars
    this.createNewCalendarsTable()
  }

  private createNewCalendarsTable(): void {
    const now = new Date()
    const nowDay = now.getDay() - 1 // range is 0 - 6 (sunday - saturday)
    const lastMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - nowDay,
      0,
      0,
      0
    )
    const monthBegin = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 0)
    this.calendars = this.rawCalendars
      .map(({ events, ...calendarInfo }) => {
        const totalDuration = events
          .map(({ duration }) => duration)
          .reduce((a, b) => Number(a) + Number(b), 0)
        const totalDurationString = msToTime(totalDuration)

        // Get latest duration
        const durationSinceMonday = events
          .map(({ start, duration }) => {
            if (lastMonday < new Date(start.dateTime)) {
              return duration
            }
            return 0
          })
          .reduce((a, b) => Number(a) + Number(b), 0)
        const durationSinceMondayString = msToTime(durationSinceMonday)

        // Get average duration
        let threeMonthAverage = events
          .map(({ start, duration }) => {
            const date = new Date(start.dateTime)
            if (date > monthBegin && date < monthEnd) {
              return duration
            }
            return 0
          })
          .reduce((a, b) => Number(a) + Number(b), 0)
        threeMonthAverage =
          threeMonthAverage /
          ((Number(monthEnd) - Number(monthBegin)) / 1000 / 60 / 60 / 24 / 7)

        const threeMonthAverageString = msToTime(threeMonthAverage)
        return {
          ...calendarInfo,
          events,
          totalDuration,
          totalDurationString,
          threeMonthAverage,
          threeMonthAverageString,
          durationSinceMonday,
          durationSinceMondayString
        }
      })
      // sort by date
      .sort((a, b) => b.durationSinceMonday - a.durationSinceMonday)
  }

  getCalendars () {
    return this.calendars
  }
}