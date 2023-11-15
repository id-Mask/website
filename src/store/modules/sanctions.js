
const state = () => ({

  /* e.g.
  {
    "data": {
      "isMatched": 0,
      "minScore": 95,
      "currentDate": "2023-11-15"
    },
    "signature": {
      "r": "18078163815705408813526875938927018028736691570437297389435296724396731769210",
      "s": "18683655356757989047167948282897820261139748319294308187023704828027976504558"
    },
    "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN",
    "metaData": {
      "error": false,
      "sourcesUsed": [
        {
          "source": "SDN",
          "publishDate": "11/14/2023"
        }
      ],
      "matches": {
        "Hilary Lyphe": []
      }
    }
  }
  */

  data: null,
})

const getters = {}

const actions = {}

const mutations = {}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
