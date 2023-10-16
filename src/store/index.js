import { createStore } from 'vuex'
import theme from './modules/theme'
import settings from './modules/settings'
import proofs from './modules/proofs'

const store = createStore({
  modules:{
    theme: theme,
    settings: settings,
    proofs: proofs,
  }
});

export default store;
