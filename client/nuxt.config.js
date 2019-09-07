
require('dotenv').config()

const polyfills = [
  'Promise',
  'Object.assign',
  'Object.values',
  'Array.prototype.find',
  'Array.prototype.findIndex',
  'Array.prototype.includes',
  'String.prototype.includes',
  'String.prototype.startsWith',
  'String.prototype.endsWith'
]

module.exports = {
  srcDir: __dirname,
  server: {
    port: process.env.APP_PORT || process.env.APP_PORT_DEV || 3000, // default: 3000
    host: process.env.APP_HOST || process.env.APP_HOST_DEV || 'localhost' // default: localhost
  },
  env: {
    baseUrl: process.env.BASE_URL || 'http://laravel-nuxt.test',
    apiUrl: process.env.APP_URL || 'http://api.laravel-nuxt.test',
    apiOrigin: process.env.APP_ORIGIN || 'http://api.laravel-nuxt.test',
    appName: process.env.APP_NAME || 'Laravel-Nuxt',
    appLocale: process.env.APP_LOCALE || 'ru',
    daDataApi: process.env.DADATA_API || '',
    apiMapsYandex: process.env.API_MAPS_YANDEX || '',
    apiVerId: process.env.API_VER_ID || 1,
    githubAuth: !!process.env.GITHUB_CLIENT_ID
  },

  head: {
    title: process.env.APP_NAME,
    titleTemplate: '%s - ' + process.env.APP_NAME,
    bodyAttrs: {
      class: 'theme-default'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Skidvis' }
    ],
    script: [
      { src: `https://cdn.polyfill.io/v2/polyfill.min.js?features=${polyfills.join(',')}` }
    ]
  },

  loading: { color: '#00C2FF' },

  router: {
    middleware: ['locale', 'check-auth']
  },

  css: [
    { src: '~assets/sass/app.scss', lang: 'scss' }
  ],

  plugins: [
    { src: '~plugins/goToQuery', ssr: false },
    '~plugins/modifiedUtils',
    '~plugins/i18n',
    '~plugins/vform',
    '~plugins/axios',
  ],

  modules: [
    '@nuxtjs/router',
    '~/modules/spa'
  ],

  build: {
    extractCSS: true
  }
}
