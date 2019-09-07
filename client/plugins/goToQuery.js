import Vue from 'vue'
import qs from 'qs'
import { goTo } from '~/utils'

Vue.use({
  /*
  * install function
  * @param  {Vue} Vue
  * @param  {object} options  lazyload options
  */
  install (Vue) {
    Vue.prototype.$goToQuery = function (query) {
      let queryString = qs.stringify(query, { encode: false })
      queryString = queryString ? ('?' + queryString) : ''
      let oldUrl = window.location.href
      let newUrl = oldUrl.split('?')[0] + queryString
      if (oldUrl !== newUrl) {
        goTo(document.title, newUrl)
      }
    }
    Vue.prototype.$sTB = function (offset) {
      Vue.prototype.$scrollTo(document.documentElement.getElementsByTagName('body')[0], 500, {
        offset: offset || 0,
        x: false,
        y: true
      })
    }
    Vue.prototype.$sTE = function (el, offset) {
      this.prototype.$scrollTo(el, 500, {
        offset: offset || -60,
        x: false,
        y: true
      })
    }
  }
})
