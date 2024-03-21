
const state = () => ({
  data: {
    proofOfAge: {
      displayName: 'Proof of Age',
      emoji: '👵',
      text: 'Prove that you have lived for more than a certain number of years.',
      address: 'B62qqpAFkz374qJpuFKYZPjT1KxSmnLoY4zEc878FaW4DSxgYNXZiny',
      proof: null,
      verificationKey: null,
      url: 'https://github.com/id-Mask/smart-contracts/blob/main/src/ProofOfAge.ts',
    },
    proofOfSanctions: {
      displayName: 'Proof of Non-Sanctions',
      emoji: '📜',
      text: 'Prove your name is not included in the OFAC sanctions list.',
      address: 'B62qqhjvvE3dwiX2hF2cZRfmHA7euo8MrzvZhPHgXJNb57vuiWePAWC',
      proof: null,
      verificationKey: null,
      url: 'https://github.com/id-Mask/smart-contracts/blob/main/src/ProofOfSanctions.ts',
    },
    proofOfUniqueHuman: {
      displayName: 'Proof of Unique Human',
      emoji: '🧠',
      text: 'Generate an exclusive identifier that is uniquely yours.',
      address: 'B62qk9ydrTZwmHDVC2CNjQz7FGUkpMhaK2LMTGecX6484PakNCzegzn',
      proof: null,
      verificationKey: null,
      url: 'https://github.com/id-Mask/smart-contracts/blob/main/src/ProofOfUniqueHuman.ts',
    },
    proofOfNationality: {
      displayName: 'Proof of Nationality',
      emoji: '🏛️',
      text: 'Prove your nationality status and country that issued the ID.',
      address: null,
      proof: null,
      verificationKey: null,
      url: 'https://github.com/id-Mask/smart-contracts/blob/main/src/ProofOfNationality.ts',
    },
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
