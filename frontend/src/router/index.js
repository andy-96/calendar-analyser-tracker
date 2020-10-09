import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Calendar from '@/views/Calendar'
import Analytics from '@/views/Analytics'
import Settings from '@/views/Settings'

Vue.use(Router)

let router = new Router({
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

// router.beforeEach((to, from, next) => {
//   console.log(to)
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     console.log('You are not authed')
//     next()
//   }
// })

export default router
