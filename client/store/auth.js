import axios from 'axios'
import Vue from 'vue'
import Cookies from 'js-cookie'

// state
export const state = () => ({
  user: {
  },
  token: null,
})

// getters
export const getters = {
  user: state => state.user,
  token: state => state.token,
  check: state => !!state.user.id
}

// mutations
export const mutations = {
  SET_TOKEN (state, token) {
    state.token = token
  },

  FETCH_USER_SUCCESS (state, user) {
    state.user = user
  },

  FETCH_USER_FAILURE (state) {
    state.token = null
  },

  LOGOUT (state) {
    state.user.id = null
    state.token = null
  },

  UPDATE_USER (state, { user }) {
    state.user = user
  },
}

// actions
export const actions = {
  saveToken ({ commit, dispatch }, { token, remember }) {
    commit('SET_TOKEN', token)

    Cookies.set('token', token, { expires: remember ? 365 : 365 })
  },

  async fetchUser ({ commit, dispatch }) {
    try {
      const { data } = await axios.get('user')
      commit('FETCH_USER_SUCCESS', data)
    } catch (e) {
      Cookies.remove('token')

      commit('FETCH_USER_FAILURE')
    }
  },

  async updateUser ({ commit, dispatch }, data) {
    commit('UPDATE_USER', data)
  },

  async logout ({ commit }) {
    try {
      await axios.post('/logout')
    } catch (e) {
    }

    Cookies.remove('token')

    commit('LOGOUT')
  },

  async fetchOauthUrl (ctx, { provider }) {
    const { data } = await axios.post(`/oauth/${provider}`)

    return data.url
  }
}
