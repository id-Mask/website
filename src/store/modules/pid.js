
const state = () => ({

  /* e.g.
    {
      "data": {
        "name": "Jane",
        "surname": "Pigeon",
        "country": "LT",
        "pno": "PNOLT-45711150161",
        "timestamp": 1697787529
      },
      "signature": {
        "r": "23715378818729740323620314664932009599574783454759750037535300398453829463817",
        "s": "21505280944049887481955932379112783210423655284158195262946966368070417903525"
      },
      "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
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
    state.data = data
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
