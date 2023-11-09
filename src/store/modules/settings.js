
const state = () => ({
  state: null,
  emoji: null,
  // https://api.minascan.io/node/berkeley/v1/graphql
  graphQLURL: 'https://berkeley.graphql.minaexplorer.com/',
  blockExplorer: 'https://minascan.io/berkeley/',
})

const getters = {
  getGraphQlEnpoint(state) {
    return state.graphQLURL
  },
  getBlockExplorerEnpoint(state) {
    return state.blockExplorer
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
