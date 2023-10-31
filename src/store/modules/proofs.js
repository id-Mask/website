
const state = () => ({

  /* e.g.
    {
      proofOfAge: {
        proof: '',
        verificationKey: '',
      },
      proofOfNonSanctions: {
        proof: '',
        verificationKey: '',
      }
      proofOfUnique: {
        proof: '',
        verificationKey: '',
      }
    }
  */

  data: {
    proofOfAge: {
      address: 'B62qqpAFkz374qJpuFKYZPjT1KxSmnLoY4zEc878FaW4DSxgYNXZiny'
    }
  },
})

const getters = {
  getData(state) {
    return state.data
  },
}

const actions = {
  async saveData({ commit }, data) {
    commit('updateData', data)
  }
}

const mutations = {
  updateData(state, data) {
    const { proofName, ...updateData } = data
    const existingData = state.data[proofName] || {}
    state.data[proofName] = { ...existingData, ...updateData }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
