<template lang="pug">
p-data-table(
  :value="categoriesModel.getCategories()"
  v-model:expandedRows="expandedRows"
  dataKey="name"
)
  p-column(:expander="true" headerStyle="width: 3rem")
  p-column(field="name" header="Category")
  p-column(field="durationSinceMondayString" header="Duration since Monday")
  p-column(field="threeMonthAverageString" header="Three month average")
  p-column(field="totalDurationString" header="Total Duration")
  template(#expansion="slotProps")
    p-data-table(:value="slotProps.data.calendars" responsiveLayout="scroll")
      p-column(field="calendarName" header="Name")
      p-column(field="durationSinceMondayString" header="Duration since Monday")
      p-column(field="threeMonthAverageString" header="Three month average")
      p-column(field="totalDurationString" header="Total Duration")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CategoriesModel } from '@/data-models'

export default defineComponent ({
  name: 'TimeTable',
  data: () => ({
    expandedRows: []
  }),
  props: {
    categoriesModel: CategoriesModel
  }
})
</script>
