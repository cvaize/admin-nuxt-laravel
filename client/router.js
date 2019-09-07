import Vue from 'vue'
import Router from 'vue-router'
import qs from 'qs'
import { scrollBehavior, parseReqObjs } from '~/utils'

Vue.use(Router)

const Welcome = () => import('~/pages/index').then(m => m.default || m)

const routes = [
  { path: '/',
    name: 'welcome',
    component: Welcome,
    meta: {
      title: 'Главная'
    }
  },
]
export function createRouter () {
  return new Router({
    routes,
    scrollBehavior,
    mode: 'history',
    parseQuery (query) {
      return parseReqObjs({ ...qs.parse(query) })
    },
    stringifyQuery (query) {
      let result = qs.stringify(query, { encode: false })

      return result ? ('?' + result) : ''
    }
  })
}
