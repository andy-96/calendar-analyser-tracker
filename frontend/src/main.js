import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import GAuth from 'vue-google-oauth2'
import dotenv from 'dotenv'

dotenv.config()

const { VUE_APP_CLIENT_ID } = process.env

Vue.config.productionTip = false

const gauthOption = {
  clientId: VUE_APP_CLIENT_ID,
  scope: 'profile email https://www.googleapis.com/auth/calendar.readonly',
  prompt: 'select_account',
}
Vue.use(GAuth, gauthOption)

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount('#app')
