<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useIsMobile } from '../utils'
import { useStore } from 'vuex'
import { sleep } from './../utils.js'

const themeVars = useThemeVars()
const isMobile = useIsMobile()
const store = useStore()
const emits = defineEmits(['logoClick'])

const char = ref('-')

const loopChars = async () => {
  const charSet = ['—', '\\', '|', '/', '—', '\\', '|', '/', '-']
  while (true) {
    await sleep(5000)
    let index = 0
    while (index < charSet.length) {
      char.value = charSet[index]
      index++
      await sleep(100)
    }
  }
}

onMounted(() => {
  loopChars()
})

</script>

<template>
  <n-layout-header bordered>
    <n-page-header :style="isMobile ? 'padding: 0em 1em' : 'padding: 1em 2em'">
      <template v-if="!isMobile" #title>
        <a href="/" style="text-decoration: none; color: inherit">
          <n-text :depth="2">
            <b>Id<n-gradient-text type="primary">{{ char }}</n-gradient-text>Mask</b>
          </n-text>
          <!-- <n-text depth="3" style="font-size: 70%"><br>zk-powered-<n-gradient-text type="primary">identity</n-gradient-text></n-text> -->
          <br>
          <n-tag :bordered="false" type="success" style="font-size: 50%; border-radius: 7px;" size="small">
            <n-gradient-text
              type="primary"
              :gradient="{ from: themeVars.primaryColorHover, to: themeVars.primaryColor, deg: 90 }"
            >testnet release</n-gradient-text>
          </n-tag>
        </a>
      </template>
      <template #header>
      </template>
      <template v-if="!isMobile" #avatar>
        <a href="/" style="text-decoration: none; color: inherit">
          <n-avatar :size="64" class="logo" @click="$emit('logoClick')">
            <n-text style="font-size: 26px;">
              {{ store.getters['settings/getEmoji'] }}
            </n-text>
          </n-avatar>
        </a>
      </template>
      <template #extra>
        <n-space horizontal>
          <n-button tertiary type="primary" size="large" tag="a" href="https://docs.idmask.xyz/" target="_blank">
            <template #icon>
              <n-icon :color="themeVars.primaryColor">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M18.5 20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10zm-5-15.379L17.378 8.5H14a.5.5 0 0 1-.5-.5V4.621zm5.914 3.793l-5.829-5.828c-.026-.026-.058-.046-.085-.07a2.072 2.072 0 0 0-.219-.18c-.04-.027-.086-.045-.128-.068c-.071-.04-.141-.084-.216-.116a1.977 1.977 0 0 0-.624-.138C12.266 2.011 12.22 2 12.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414z" fill="currentColor"></path></g></svg>
              </n-icon>
            </template>
            Docs
          </n-button>
          <n-button tertiary type="primary" size="large" @click="store.dispatch('theme/changeTheme')">
            <template #icon>
              <n-icon>
                <div v-if="store.getters['theme/themeIsLight']">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7"></path></g></svg>
                </div>
                <div v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                </div>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </template>
      <template #footer>
      </template>
    </n-page-header>
  </n-layout-header>
</template>

<style scoped>

.logo {
  will-change: filter;
  transition: filter .9s ease-out;
  transition: transform .6s ease-out;
  cursor: pointer;
}
.logo:hover {
  filter: drop-shadow(0em 0em 0.3em v-bind(themeVars.primaryColor));
  transform: scale(1.1);
}

</style>
