
const state = () => ({
  proofs: {},
})

const getters = {
  getProofs(state) {
    return state.proofs
  },
}

const actions = {
  async saveProof({ commit }, data) {
    commit('updateProof', data)
  }
}

const mutations = {
  updateProof(state, data) {
    state.proofs[data.proofName] = data.proof
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
