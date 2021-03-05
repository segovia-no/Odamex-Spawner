import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'serverlist',
      component: require('@/components/ServerList').default
    },
    {
      path: '/directconnection',
      name: 'directconnection',
      component: require('@/components/DirectConnection').default
    },
    {
      path: '/wads',
      name: 'wads',
      component: require('@/components/Wads').default
    },
    {
      path: '/demos',
      name: 'demos',
      component: require('@/components/DemoList').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/Settings').default
    }
  ]
})
