import { darkTheme, lightTheme } from 'naive-ui'
import { merge } from '../../utils'

const state = () => ({
  themeIsLight: JSON.parse(localStorage.getItem('themeIsLight')) || true,
  lightTheme: lightTheme,
  darkTheme: darkTheme,

  // overrides for both light and dark
  themeOverrides: {
    common: {
      borderRadius: '7px',
      primaryColor: '#5F5FEAFF',
      primaryColorHover: '#06bef5',
      primaryColorPressed: '#09dbfd',
      successColor: '#5F5FEAFF',
    },
    Message: {
      padding: '20px 40px'
    }
  },

  // separate overrides for dark / light only
  themeOverridesDarkOnly: { },
  themeOverridesLightOnly: {
    Message: {
      color: '#EFEFF5FF',
      colorInfo: '#EFEFF5FF',
      colorSuccess: '#EFEFF5FF',
      colorError: '#EFEFF5FF',
      colorWarning: '#EFEFF5FF',
      colorLoading: '#EFEFF5FF'
    }
  },
})

const getters = {
  getTheme(state) {
    return state.themeIsLight ? state.lightTheme : state.darkTheme
  },
  getThemeOverrides(state) {
    // merge the both / light / dark overrides as needed
    // cant use {..obj, ..obj} for deep objects, to merge nested use custom fn
    if (state.themeIsLight) {
      return merge(state.themeOverrides, state.themeOverridesLightOnly)
    } else {
      return merge(state.themeOverrides, state.themeOverridesDarkOnly)
    }
  },
  themeIsLight(state) {
    return state.themeIsLight
  }
}

const actions = {
  async changeTheme({ commit }) {
    commit('changeTheme')
  }
}

const mutations = {
  changeTheme(state) {
    localStorage.setItem('themeIsLight', !state.themeIsLight)
    state.themeIsLight = !state.themeIsLight
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
