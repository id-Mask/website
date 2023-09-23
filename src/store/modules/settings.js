
const state = () => ({
  state: null
})

const getters = {
  getState(state) {
    return state.state
  },
}

const actions = {
  async changeState({ commit }) {
    commit('changeState')
  }
}

const mutations = {
  changeState(state) {
    state.state = state
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
