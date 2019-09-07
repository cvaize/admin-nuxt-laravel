import Vue from 'vue'
import axios from 'axios'
// import swal from 'sweetalert2'
import { $callToast } from '~/utils'

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default ({ app, store, redirect }) => {
  axios.defaults.baseURL = process.env.apiUrl + '/' + process.env.apiVerId

  if (process.server) {
    return
  }

  // Request interceptor
  axios.interceptors.request.use(request => {
    request.baseURL = process.env.apiUrl + '/' + (request.apiVerId || process.env.apiVerId)

    const token = store.getters['auth/token']

    if (token) {
      request.headers.common['Authorization'] = `Bearer ${token}`
    }

    const locale = store.getters['lang/locale']
    if (locale) {
      request.headers.common['Accept-Language'] = locale
    }

    return request
  })

  // Response interceptor
  axios.interceptors.response.use(response => response, error => {
    const { status, data } = error.response || {}

    if (status >= 500) {
      // swal({
      //   type: 'error',
      //   title: app.i18n.t('error_alert_title'),
      //   text: app.i18n.t('error_alert_text'),
      //   reverseButtons: true,
      //   confirmButtonText: app.i18n.t('ok'),
      //   cancelButtonText: app.i18n.t('cancel')
      // })
    }

    // if (data && process.client) {
    //   if (data.alert && data.alert.type) {
    //     $callToast(data.alert, Vue.toast)
    //   }
    //   if (data.action && data.action.type) {
    //     switch (data.action.type) {
    //       case 'redirect':
    //         if (data.action.url) {
    //           window.location.replace(data.action.url)
    //         } else if (data.action.name) {
    //           redirect({ name: data.action.name })
    //         }
    //         break
    //     }
    //   }
    // }
    // let adw = {
    //   status: 'aaawuydgua',
    //   alert: {
    //     type: 'success|warning|error',
    //     title: 'Восстановление пароля', // Не обязательно, если нет text то обязательно
    //     text: 'Ссылка уже недействительна' // Если нет title обязательно, если есть title то не обязательно
    //   },
    //   action: {
    //     type: 'redirect',
    //     url: '/'
    //   }
    // }

    // if (status === 401 && store.getters['auth/check']) {
    if (status === 401) {
      store.commit('auth/LOGOUT')

      redirect({ name: 'login' })
      // swal({
      //   type: 'warning',
      //   title: app.i18n.t('token_expired_alert_title'),
      //   text: app.i18n.t('token_expired_alert_text'),
      //   reverseButtons: true,
      //   confirmButtonText: app.i18n.t('ok'),
      //   cancelButtonText: app.i18n.t('cancel')
      // }).then(() => {
      //   store.commit('auth/LOGOUT')
      //
      //   redirect({ name: 'login' })
      // })
    }

    return Promise.reject(error)
  })
}
