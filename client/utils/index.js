
export function isObject (v) {
  return v && typeof v === 'object' && v.constructor === Object
}
export function isString (v) {
  return typeof v === 'string' || v instanceof String
}
export function isNumeric (n) {
  return (parseFloat(n) === n >>> 0)
}
export function parseNum (n) {
  let pF = parseFloat(n)
  return (pF === n >>> 0) ? pF : n
}
export function parseReqObjs (v) {
  if (isObject(v) || Array.isArray(v)) {
    for (let i in v) {
      v[i] = parseReqObjs(v[i])
    }
    return v
  }
  if (isString(v)) {
    return parseNum(v)
  }
  return v
}

/**
 * Get cookie from request.
 *
 * @param  {Object} req
 * @param  {String} key
 * @return {String|undefined}
 */

export function cookieFromRequest (req, key, json) {
  if (!req.headers.cookie) {
    return
  }

  const cookie = req.headers.cookie.split(';').find(
    c => c.trim().startsWith(`${key}=`)
  )

  if (cookie) {
    let value = cookie.split('=')[1]
    return (json) ? JSON.parse(decodeURIComponent(value)) : value
  }
}

/**
 * https://router.vuejs.org/en/advanced/scroll-behavior.html
 */
export function scrollBehavior (to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  }

  let position = {}

  if (to.matched.length < 2) {
    position = { x: 0, y: 0 }
  } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
    position = { x: 0, y: 0 }
  } if (to.hash) {
    position = { selector: to.hash }
  }

  return position
}

export function goTo (title, url) {
  if (typeof history.pushState !== 'undefined') {
    history.pushState(null, title, url)
  } else {
    window.location.assign(url)
  }
}

/**
 * @param  {Object} options
 * @return {Window}
 */
export function openWindow (url, title, options = {}) {
  if (typeof url === 'object') {
    options = url
    url = ''
  }

  options = { url, title, width: 600, height: 720, ...options }

  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top
  const width = window.innerWidth || document.documentElement.clientWidth || window.screen.width
  const height = window.innerHeight || document.documentElement.clientHeight || window.screen.height

  options.left = ((width / 2) - (options.width / 2)) + dualScreenLeft
  options.top = ((height / 2) - (options.height / 2)) + dualScreenTop

  const optionsStr = Object.keys(options).reduce((acc, key) => {
    acc.push(`${key}=${options[key]}`)
    return acc
  }, []).join(',')

  const newWindow = window.open(url, title, optionsStr)

  if (window.focus) {
    newWindow.focus()
  }

  return newWindow
}

export function getWindowParams () {
  let w = window
  let d = document
  let e = d.documentElement
  let g = d.getElementsByTagName('body')[0]
  let x = w.innerWidth || e.clientWidth || g.clientWidth
  let y = w.innerHeight || e.clientHeight || g.clientHeight
  return { x, y }
}
export function getFavicon (type) {
    return {
        meta: [
            { name: 'msapplication-TileColor', content: '#ffffff' },
            { name: 'msapplication-config', content: '/favicon/default/browserconfig.xml' },
            { name: 'theme-color', content: '#ffffff' }
        ],
        link: [
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/default/apple-touch-icon.png' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/default/favicon-32x32.png' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/default/favicon-16x16.png' },
            { rel: 'manifest', href: '/favicon/default/site.webmanifest' },
            { rel: 'mask-icon', href: '/favicon/default/safari-pinned-tab.svg', color: '#00c2ff' },
            { rel: 'shortcut icon', href: '/favicon/default/favicon.ico' }
        ]
    }
}
