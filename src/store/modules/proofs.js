
const state = () => ({

  /* state structure

  proofs: {
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


  data: {},
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
    state.data[data.proofName] = data.proof ? { proof: data.proof } : { verificationKey: data.verificationKey }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
