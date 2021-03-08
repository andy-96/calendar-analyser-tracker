import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Button from 'primevue/button'

import App from '@/App.vue'
import router from '@/router'

createApp(App)
  .use(router)
  .use(PrimeVue)
  .component('p-data-table', DataTable)
  .component('p-column', Column)
  .component('p-column-group', ColumnGroup)
  .component('p-button', Button)
  .mount('#app')
