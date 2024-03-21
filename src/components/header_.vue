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

          <n-popover
            trigger="click"
            :show-arrow="false"
          >
            <template #trigger>
              <n-button tertiary type="primary" size="large">
                <template #icon>
                  <n-icon :color="themeVars.primaryColor">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z"></path><circle cx="12" cy="12" r="3"></circle></g></svg>
                  </n-icon>
                </template>
              </n-button>
            </template>
            <div>
              <n-space vertical>
                <n-h4 type="primary">API Settings</n-h4>

                <n-input-group >
                  <n-input-group-label>
                    <n-text depth="3" style="font-size: 80%">Archive graphQL</n-text>
                  </n-input-group-label>
                  <n-input v-model:value="store.state.settings.graphQLURL" type="text" placeholder="Archive graphQLURL" style="font-size: 80%">
                    <template #prefix>
                      <n-icon :color="themeVars.primaryColor">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path opacity=".3" d="M5 19h14V8H5v11zm7-9l4 4h-2.55v3h-2.91v-3H8l4-4z" fill="currentColor"></path><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.42l.82-1zM19 19H5V8h14v11zm-8.45-2h2.9v-3H16l-4-4l-4 4h2.55z" fill="currentColor"></path></svg>
                      </n-icon>
                    </template>
                  </n-input>
                </n-input-group>
                
                <n-input-group>
                  <n-input-group-label>
                    <n-text depth="3" style="font-size: 80%">Block explorer</n-text>
                  </n-input-group-label>
                  <n-input v-model:value="store.state.settings.blockExplorer" type="text" placeholder="Block explorer" style="font-size: 80%">
                    <template #prefix>
                      <n-icon :color="themeVars.primaryColor">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M10 7.96l3.029-1.21l-7.5-3l-2.586 1.034a1.499 1.499 0 0 0-.364.208L10 7.961zM2.035 5.853A1.5 1.5 0 0 0 2 6.176v7.646a1.5 1.5 0 0 0 .943 1.393L8.7 17.518c.26.104.528.175.8.214V8.838L2.035 5.852zm8.465 11.88a3.5 3.5 0 0 0 .8-.214l5.757-2.303A1.5 1.5 0 0 0 18 13.822V6.176c0-.11-.012-.219-.035-.324L10.5 8.838v8.894zm6.921-12.74l-3.046 1.219l-7.5-3L8.7 2.48a3.5 3.5 0 0 1 2.6 0l5.757 2.303a1.5 1.5 0 0 1 .364.208z" fill="currentColor"></path></g></svg>
                      </n-icon>
                    </template>
                  </n-input>
                </n-input-group>

                <n-input-group>
                  <n-input-group-label>
                    <n-text depth="3" style="font-size: 80%">zk-Oracle</n-text>
                  </n-input-group-label>
                  <n-input v-model:value="store.state.settings.zkOracle" placeholder="graphQLURL" style="font-size: 80%">
                    <template #prefix>
                      <n-icon :color="themeVars.primaryColor">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><circle cx="21" cy="26" r="2" fill="currentColor"></circle><circle cx="21" cy="6" r="2" fill="currentColor"></circle><circle cx="4" cy="16" r="2" fill="currentColor"></circle><path d="M28 12a3.996 3.996 0 0 0-3.858 3h-4.284a3.966 3.966 0 0 0-5.491-2.643l-3.177-3.97A3.963 3.963 0 0 0 12 6a4 4 0 1 0-4 4a3.96 3.96 0 0 0 1.634-.357l3.176 3.97a3.924 3.924 0 0 0 0 4.774l-3.176 3.97A3.96 3.96 0 0 0 8 22a4 4 0 1 0 4 4a3.962 3.962 0 0 0-.81-2.387l3.176-3.97A3.966 3.966 0 0 0 19.858 17h4.284A3.993 3.993 0 1 0 28 12zM6 6a2 2 0 1 1 2 2a2.002 2.002 0 0 1-2-2zm2 22a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2zm8-10a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2zm12 0a2 2 0 1 1 2-2a2.002 2.002 0 0 1-2 2z" fill="currentColor"></path></svg>
                      </n-icon>
                    </template>
                  </n-input>
                </n-input-group>

                <br/>
                <n-h4 type="primary">App Settings</n-h4>

                <n-flex align="center" justify="space-between">
                  <n-popover trigger="hover">
                    <template #trigger>
                      <n-text depth="3" style="font-size: 80%">Console debug mode</n-text>
                    </template>
                    <n-text depth="3" style="font-size: 80%">
                      Log intermediate app steps to console. This will include personal data, proofs, etc.
                    </n-text>
                    </n-popover>
                  <n-switch v-model:value="store.state.settings.consoleDebugMode" />
                </n-flex>

                <n-flex align="center" justify="space-between">
                  <n-popover trigger="hover">
                    <template #trigger>
                      <n-text depth="3" style="font-size: 80%">Request user signature on proof creation</n-text>
                    </template>
                    <n-text depth="3" style="font-size: 80%">
                      Make the user sign a message and embed it into the proof. This will allow proof consumer to verify if
                      the proof was created using the same wallet at a cost of additional inconveniance to the user by
                      requiring to owm a Mina account (public private key pair) and use it together with a wallet to sign a piece of data.
                    </n-text>
                    </n-popover>
                  <n-switch v-model:value="store.state.settings.requestUserWalletSignature" />
                </n-flex>

              </n-space>
            </div>
          </n-popover>

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
