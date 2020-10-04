import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Calendar from '@/views/Calendar'
import Analytics from '@/views/Analytics'
import Settings from '@/views/Settings'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: Calendar,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: Analytics,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
  ],
})
