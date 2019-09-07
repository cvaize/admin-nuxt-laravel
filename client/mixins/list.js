import { cloneDeep } from 'lodash'
import Fuse from 'fuse.js'

export default function constructor ({
  axios,
  globalNamespace, apiUrl, pathResponse = null, pathTotal = null, apiQuery = {}, urlQuery = {},
  allowedParams = [], buildWatchers = null, filters = {}
}) {
  let gN = globalNamespace
  if (!gN || !apiUrl) {
    throw new Error()
  }

  let actionTypes = {
    PAGINATE: 'PAGINATE',
    LOADMORE: 'LOADMORE'
  }
  let beforeTypes = {
    SEARCH: 'SEARCH'
  }
  let afterTypes = {
    DELETE: 'DELETE'
  }
  const CancelToken = axios.CancelToken
  let cancelRequest

  function getFromPath (data, path) {
    if (!path) {
      return data
    }
    let res = -1
    try {
      let th = path.split('.')
      res = cloneDeep(data)
      for (let i in th) {
        let item = th[i]
        res = res[item]
      }
    } catch (e) {
      res = -1
    }
    return res
  }

  function getWatcher ({ type = '' }) {
    return function () {
      if (cancelRequest) {
        cancelRequest()
      }
      switch (type) {
        case beforeTypes.SEARCH:
          this[gN].urlQuery.page = 1
          break
      }
      this.$goToQuery(this[gN].urlQuery)

      this[gN].loadingList = true
      this[gN].loadedList = false
      axios.get(this[gN].apiUrl, {
        params: {
          ...this[gN].apiQuery,
          ...this[gN].urlQuery
        },
        cancelToken: new CancelToken(function executor (c) {
          // An executor function receives a cancel function as a parameter
          cancelRequest = c
        })
      }).then(({ data }) => {
        let error = false
        let collection = getFromPath(data, this[gN].pathResponse)
        let total = getFromPath(data, this[gN].pathTotal)

        if (total === -1) {
          console.error('#LIST_1')
          error = true
        }
        if (typeof total === 'undefined') {
          console.error('#LIST_2')
          error = true
        }
        if (collection === -1) {
          console.error('#LIST_3')
          error = true
        }
        if (typeof collection === 'undefined') {
          console.error('#LIST_4')
          error = true
        }
        if (!error) {
          switch (this[gN].actionType) {
            case actionTypes.LOADMORE:
              this.$set(this[gN], 'collection', [...this[gN].collection, ...collection])
              this.$set(this[gN], 'actionType', actionTypes.PAGINATE)
              break
            case actionTypes.PAGINATE:
              this.$set(this[gN], 'collection', collection)
              break
          }
          switch (type) {
            case afterTypes.DELETE:
              if (this[gN].collection.length === 0 && this[gN].urlQuery.page > 1) {
                this.$set(this[gN].urlQuery, 'page', this[gN].urlQuery.page - 1)
                return
              }
              break
          }

          this[gN].total = total
        }
        this[gN].loadingList = false
        this[gN].loadedList = true
      }).catch((e) => {
        if (!axios.isCancel(e)) {
          console.log(e)
        }
      })
    }
  }

  function getUrlQuery (query = {}) {
    let r = {
      page: 1,
      perPage: 20,
      search: ''
    }
    let allowedParams_ = [ 'page', 'perPage', 'search', ...allowedParams, ...Object.keys(filters) ]
    if (query) {
      for (let i in allowedParams_) {
        let name = allowedParams_[i]
        if (typeof query[name] !== 'undefined') {
          r[name] = query[name]
        }
      }
    }
    return r
  }

  function setUrlQuery (query = {}) {
    this.$set(this[gN], 'urlQuery', getUrlQuery(query))
  }

  function watchers () {
    let watch = {
      '$route.query': function () {
        setUrlQuery.call(this, this.$route.query)
      },
      [`${gN}.urlQuery.search`]: getWatcher({ type: beforeTypes.SEARCH }),
      [`${gN}.urlQuery.page`]: getWatcher({})
    }

    for (let i in filters) {
      watch[`${gN}.urlQuery.${i}`] = getWatcher({ type: beforeTypes.SEARCH })
    }

    if (buildWatchers) {
      watch = {
        ...watch, ...buildWatchers.call(this, { beforeTypes, getWatcher, gN })
      }
    }
    return watch
  }
  let computed = {}

  for (let i in filters) {
    filters[i].name = i
    filters[i].favorites = []
    filters[i].collection = []
    filters[i].selected = {}
    filters[i].fuse = []
    filters[i].search = ''
    filters[i].loading = false
    filters[i].loaded = true

    computed[gN + 'FS_' + i] = function () {
      return (this[gN].filters[i].search.length > 0) ? this[gN].filters[i].fuse.search(this[gN].filters[i].search) : this[gN].filters[i].collection
    }
  }

  const data = {
    [gN]: {
      filters,
      apiUrl,
      apiQuery,
      pathResponse,
      pathTotal,
      urlQuery: getUrlQuery(urlQuery),
      loadingList: false,
      loadedList: true,
      collection: [],
      total: 0,
      actionType: actionTypes.PAGINATE
    }
  }

  return {
    afterTypes,
    beforeTypes,
    getWatcher,
    async getStartData ({ query = {}, error, defaultApiQuery = {}, defaultUrlQuery = {}, defaultData = {}, cbResponse = null }) {
      let res = { ...data }

      res[gN] = { ...res[gN], ...defaultData }

      res[gN].apiQuery = {
        ...apiQuery,
        ...defaultApiQuery
      }

      res[gN].urlQuery = getUrlQuery({
        ...urlQuery, ...defaultUrlQuery, ...query
      })

      for (let i in filters) {
        if (!res[gN].urlQuery[i]) {
          res[gN].urlQuery[i] = []
        }
      }

      try {
        let { data } = await axios.get(res[gN].apiUrl, {
          params: {
            ...res[gN].apiQuery,
            ...res[gN].urlQuery
          }
        })
        let error = false
        let collection = getFromPath(data, pathResponse)
        let total = getFromPath(data, pathTotal)

        if (cbResponse) {
          res[gN] = { ...res[gN], ...cbResponse({ data, getFromPath }) }
        }

        if (total === -1) {
          console.error('#LIST_START_1')
          error = true
        }
        if (typeof total === 'undefined') {
          console.error('#LIST_START_2')
          error = true
        }
        if (!error) {
          res[gN].total = total
          res[gN].collection = collection
        }
        if (collection === -1) {
          console.error('#LIST_START_3')
          error = true
        }
        if (typeof collection === 'undefined') {
          console.error('#LIST_START_4')
          error = true
        }
        if (!error) {
          res[gN].collection = collection
        }
      } catch (e) {
        error({ statusCode: e.response.status })
      }
      for (let i in filters) {
        let filter = filters[i].start
        try {
          let { data } = await axios.get(filter.url, {
            params: {
              ...filter.query,
              orWhereIn: res[gN].urlQuery[i] || []
            }
          })
          let error = false
          let collection = getFromPath(data, filter.pathResponse)

          if (collection === -1) {
            console.error('#LIST_START_3-' + i)
            error = true
          }
          if (typeof collection === 'undefined') {
            console.error('#LIST_START_4-' + i)
            error = true
          }

          if (!error) {
            filters[i].favorites = collection
            if (res[gN].urlQuery[i] && res[gN].urlQuery[i].length) {
              for (let j in collection) {
                let item = collection[j]
                if (res[gN].urlQuery[i].indexOf(item.id) !== -1) {
                  filters[i].selected[item.id] = { ...item }
                }
              }
            }
          }
        } catch (e) {
          console.log(e)
        }
      }

      return res
    },
    mixin: {
      watch: watchers.call(this),
      data () {
        return data
      },
      computed: {
        ...computed,
        [gN + 'ShowPaginate'] () {
          return (this[gN + 'Pages'] && this[gN + 'Pages'] > 1)
        },
        [gN + 'ShowLoadMore'] () {
          return (this[gN + 'ShowPaginate'] && this[gN + 'Page'] < this[gN + 'Pages'])
        },
        [gN + 'IsLoading'] () {
          return this[gN].loadingList
        },
        [gN + 'IsLoaded'] () {
          return this[gN].loadedList
        },
        [gN + 'Page'] () {
          return this[gN].urlQuery.page
        },
        [gN + 'Pages'] () {
          return Math.ceil(this[gN].total / this[gN].urlQuery.perPage)
        },
        [gN + 'Total'] () {
          return this[gN].total
        },
        [gN + 'Items'] () {
          return this[gN].collection
        },
        [gN + 'Params'] () {
          return {
            showPaginate: this[gN + 'ShowPaginate'],
            showLoadMore: this[gN + 'ShowLoadMore'],
            isLoading: this[gN + 'IsLoading'],
            isLoaded: this[gN + 'IsLoaded'],
            page: this[gN + 'Page'],
            pages: this[gN + 'Pages'],
            total: this[gN + 'Total'],
            items: this[gN + 'Items'],
            loadMore: this[gN + 'LoadMore'],
            goPage: this[gN + 'GoPage']
          }
        }
      },
      methods: {
        [gN + 'LoadMore'] () {
          this[gN].actionType = actionTypes.LOADMORE
          this.$set(this[gN].urlQuery, 'page', this[gN].urlQuery.page + 1)
        },
        [gN + 'GoPage'] (page) {
          this[gN].urlQuery.page = Number(page)
        },
        [gN + 'Filter'] (type, item) {
          if (this[gN].filters[type]) {
            let id = Number(item.id)
            if (this[gN].urlQuery[type]) {
              let index = this[gN].urlQuery[type].indexOf(id)
              if (index === -1) {
                this[gN].urlQuery[type].push(id)
                this.$set(this[gN].filters[type].selected, id, { ...item })
              } else {
                this.$delete(this[gN].urlQuery[type], index)
                this.$delete(this[gN].filters[type].selected, id)
              }
            }
          }
        },
        [gN + 'ClearFilter'] (type) {
          if (this[gN].filters[type]) {
            this[gN].urlQuery[type] = []
            this[gN].filters[type].selected = {}
          }
        },
        async [gN + 'HandleAll'] (type) {
          if (this[gN].filters[type]) {
            this.$modal.push('modal-filter-' + type)
            // Подгружается один раз
            if (!this[gN].filters[type].collection.length) {
              this[gN].filters[type].loading = true
              try {
                let { data } = await axios.get(this[gN].filters[type].fetch.url, {
                  params: this[gN].filters[type].fetch.query
                })
                let error = false
                let collection = getFromPath(data, this[gN].filters[type].fetch.pathResponse)

                if (collection === -1) {
                  console.error('#LIST_START_3-' + type)
                  error = true
                }
                if (typeof collection === 'undefined') {
                  console.error('#LIST_START_4-' + type)
                  error = true
                }

                if (!error) {
                  this[gN].filters[type].collection = collection
                  this[gN].filters[type].fuse = new Fuse(collection, {
                    shouldSort: false,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: [
                      'name'
                    ]
                  })
                }
              } catch (e) {
                console.log(e)
                await this.$callToast({
                  type: 'error',
                  text: 'Загрузить категории не удалось'
                })
                this.$modal.pop()
              }
              this[gN].filters[type].loading = false
            }
          }
        }
      }
    }
  }
}
