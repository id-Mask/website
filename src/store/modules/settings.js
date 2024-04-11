
const state = () => ({
  state: null,
  emoji: null,
  // https://api.minascan.io/node/berkeley/v1/graphql
  // https://berkeley.graphql.minaexplorer.com/
  // https://archive.berkeley.minaexplorer.com/
  graphQLURL: 'https://archive.berkeley.minaexplorer.com/',
  blockExplorer: 'https://minascan.io/berkeley/',
  zkOracle: 'https://id-mask-oracle-e6ngsd55oa-uc.a.run.app/',
  consoleDebugMode: false,
  userSignatureOptions: {
    requestUserWalletSignature: false,
    defaultKeyPair: {
      publicKey: 'B62qqFJyFDcPNuuoV2Af8nWGib7tE9MjBCJ2MEPDVMVM71iwGcjR6RH',
      privateKey: 'EKFFPMTjJivav7xxEdXyCVKs5KedZsZaQWSWXkXdM4UjeH54rJV4'
    }
  },
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
