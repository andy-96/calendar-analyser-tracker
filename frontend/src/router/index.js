import Vue from 'vue'
import Router from 'vue-router'
import { mongodb } from '../utils/index'
//import Login from '@/views/Login'
import Calendar from '@/views/Calendar'
import Analytics from '@/views/Analytics'
import Settings from '@/views/Settings'

Vue.use(Router)

let router = new Router({
  routes: [
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

router.beforeEach(async (to, from, next) => {
  if (to.name !== 'Login') {
    const {
      data: { msg: isAuthenticated },
    } = await mongodb.get('/auth/check')
    if (!isAuthenticated) {
      window.location = 'http://localhost:3000/auth/google'
    }
    next()
  }
  next()
})

export default router
