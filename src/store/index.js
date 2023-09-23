import { createStore } from 'vuex'
import theme from './modules/theme'
import settings from './modules/settings'

const store = createStore({
  modules:{
    theme: theme,
    settings: settings,
  }
});

export default store;
