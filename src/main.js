import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// font (the font is set in style.css body)
import '@fontsource/jetbrains-mono'

// other deps
import naive from 'naive-ui'
import store from './store/index'

const app = createApp(App)
app.use(naive)
app.use(store)

app.mount('#app')
