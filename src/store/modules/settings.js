
const state = () => ({
  state: null,
  emoji: null,
  // https://api.minascan.io/node/berkeley/v1/graphql
  // https://berkeley.graphql.minaexplorer.com/
  // https://archive.berkeley.minaexplorer.com/
  graphQLURL: 'https://archive.berkeley.minaexplorer.com/',
  blockExplorer: 'https://minascan.io/berkeley/',
  zkOracle: 'https://id-mask-oracle-e6ngsd55oa-uc.a.run.app/',
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
