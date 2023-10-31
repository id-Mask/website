
const state = () => ({
  state: null,
  emoji: null,
  graphQLURL: 'https://berkeley.graphql.minaexplorer.com/',
})

const getters = {
  getGraphQlEnpoint(state) {
    return state.graphQLURL
  },
  getEmoji(state) {
    return state.emoji
  },
}

const actions = {
  async changeEmoji({ commit }, emoji) {
    commit('changeEmoji', emoji)
  }
}

const mutations = {
  changeEmoji(state, emoji) {
    state.emoji = emoji
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
