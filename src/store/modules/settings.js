
const state = () => ({
  state: null,
  emoji: null,
  useCache: true,

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
  passkeysOptions: {
    requestPasskeysSignature: false,
    defaultSignatureValues: {
      id: '0000000000000000000000',
      publicKeyHex: '0x0418dc9fe2130baf94619766415817c5c16bd290590b7910280efb31490bb01ccc80e30e5e50739c16fe3dbccea3266e8fee690b0ad056be94b030d460bdb4b507',
      signatureHex: '0x9631d0a5540a095d6c88c6dceb276df839af4d9b4de9c7ac37022bfafdcc988248dee789ad6e0fdf95e0d399c3f56a6aa13d5f10ac5a7b0d48d8cf9450f053ad',
      payloadHex: '0x1fe3ceb2df37192f47c1e72c2dbc0cec691a74045c3669d89cedef462c0bea79',
    }
  }
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
