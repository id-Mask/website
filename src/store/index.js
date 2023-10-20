import { createStore } from 'vuex'
import theme from './modules/theme'
import settings from './modules/settings'
import proofs from './modules/proofs'
import pid from './modules/pid'

const store = createStore({
  modules:{
    theme: theme,
    settings: settings,
    proofs: proofs,
    pid: pid,
  }
});

export default store;
