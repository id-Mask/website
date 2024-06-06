
const state = () => ({
  state: null,
  emoji: null,

  selectedNetwork: 'devnet',
  networks: {
    // MAINNET
    mainnet: {
      networkId: 'mainnet',
      nodeUrl: 'https://api.minascan.io/node/mainnet/v1/graphql',
      graphQLURL: 'https://api.minascan.io/archive/mainnet/v1/graphql',
      blockExplorer: 'https://minascan.io/mainnet/',
    },
    // TESTNET
    devnet: {
      networkId: 'testnet',
      nodeUrl: 'https://api.minascan.io/node/devnet/v1/graphql',
      graphQLURL: 'https://api.minascan.io/archive/devnet/v1/graphql',
      blockExplorer: 'https://minascan.io/devnet/',
    },
  },

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
