import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

import App from '@/App.vue'
import router from '@/router'

createApp(App)
  .use(router)
  .use(PrimeVue)
  .use(ToastService)
  .component('p-data-table', DataTable)
  .component('p-column', Column)
  .component('p-column-group', ColumnGroup)
  .component('p-button', Button)
  .component('p-dialog', Dialog)
  .component('p-input-text', InputText)
  .component('p-dropdown', Dropdown)
  .component('p-checkbox', Checkbox)
  .component('p-chart', Chart)
  .component('p-spinner', ProgressSpinner)
  .component('p-toast', Toast)
  .mount('#app')
