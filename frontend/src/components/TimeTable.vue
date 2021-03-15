<template lang="pug">
p-data-table.p-datatable-sm(
  :value="categoriesModel.getCategories()"
  v-model:expandedRows="expandedRows"
  dataKey="id"
)
  p-column(:expander="true" headerStyle="width: 3rem")
  p-column(field="name" header="Category")
  p-column(header="Duration since Monday")
    template(#body="slotProps") {{ msToTime(slotProps.data.durationSinceMonday) }}
  p-column(header="Duration last week")
    template(#body="slotProps") {{ msToTime(slotProps.data.durationLastWeek) }}
  p-column(header="Three month average")
    template(#body="slotProps") {{ msToTime(slotProps.data.threeMonthAverage) }}
  p-column(header="Total Duration")
    template(#body="slotProps") {{ msToTime(slotProps.data.totalDuration) }}
  template(#expansion="slotProps")
    p-data-table.p-datatable-sm(:value="slotProps.data.calendars" responsiveLayout="scroll")
      p-column(field="calendarName" header="Name")
      p-column(header="Duration since Monday")
        template(#body="slotProps") {{ msToTime(slotProps.data.durationSinceMonday) }}
      p-column(header="Duration last week")
        template(#body="slotProps") {{ msToTime(slotProps.data.durationLastWeek) }}
      p-column(header="Three month average")
        template(#body="slotProps") {{ msToTime(slotProps.data.threeMonthAverage) }}
      p-column(header="Total Duration")
        template(#body="slotProps") {{ msToTime(slotProps.data.totalDuration) }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CategoriesModel } from '@/data-models'
import { msToTime } from '@/utils'

export default defineComponent({
  name: 'TimeTable',
  data: () => ({
    expandedRows: []
  }),
  props: {
    categoriesModel: CategoriesModel
  },
  methods: {
    msToTime(ms: number): string {
      return msToTime(ms)
    }
  }
})
</script>
