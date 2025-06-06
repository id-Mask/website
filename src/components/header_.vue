<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useIsMobile } from '../utils'
import { useStore } from 'vuex'
import { sleep } from './../utils.js'
import PrecompileButtons from './componentUtils/precompileButtons.vue'

import { QrcodeStream } from 'vue-qrcode-reader'

const themeVars = useThemeVars()
const isMobile = useIsMobile()
const store = useStore()
const emits = defineEmits(['logoClick'])

const char = ref('-')
const showScannerModal = ref(false)

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

const onQrCodeDetect = (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const url = detectedCodes[0].rawValue
    window.open(url, '_blank')
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
            >zk-powered-identity</n-gradient-text>
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

          <!-- <n-button tertiary type="primary" size="large" @click="showScannerModal = !showScannerModal">
            <template #icon>
              <n-icon :color="themeVars.primaryColor">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><path d="M96,124.2c0-6.9,5.2-12.2,12.2-12.2H176V64h-66.8C75.7,64,48,90.7,48,124.2V192h48V124.2z"></path><path d="M403.6,64H336v48h67.2c6.9,0,12.8,5.2,12.8,12.2V192h48v-67.8C464,90.7,437,64,403.6,64z"></path><path d="M416,386.8c0,6.9-5.2,12.2-12.2,12.2H336v49h67.8c33.5,0,60.2-27.7,60.2-61.2V320h-48V386.8z"></path><path d="M108.2,399c-6.9,0-12.2-5.2-12.2-12.2V320H48v66.8c0,33.5,27.7,61.2,61.2,61.2H176v-49H108.2z"></path></g></svg>
              </n-icon>
            </template>
          </n-button> -->

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

                <n-h4 type="primary">Network: {{ store.state.settings.selectedNetwork }}</n-h4>

                <n-button-group horizontal>
                  <n-button 
                    style="font-size: 80%"
                    @click="store.state.settings.selectedNetwork = 'mainnet'"
                    :type="store.state.settings.selectedNetwork == 'mainnet' ? 'success' : 'tertiary'"
                  >
                    <template #icon>
                      <n-icon><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M15 12h2v18h-2z" fill="currentColor"></path><path d="M11.33 18.22a7 7 0 0 1 0-10.44l1.34 1.49a5 5 0 0 0 0 7.46z" fill="currentColor"></path><path d="M20.67 18.22l-1.34-1.49a5 5 0 0 0 0-7.46l1.34-1.49a7 7 0 0 1 0 10.44z" fill="currentColor"></path><path d="M8.4 21.8a11 11 0 0 1 0-17.6l1.2 1.6a9 9 0 0 0 0 14.4z" fill="currentColor"></path><path d="M23.6 21.8l-1.2-1.6a9 9 0 0 0 0-14.4l1.2-1.6a11 11 0 0 1 0 17.6z" fill="currentColor"></path></svg></n-icon>
                    </template>
                    Mainnet
                  </n-button>
                  <n-button 
                  style="font-size: 80%"
                    @click="store.state.settings.selectedNetwork = 'devnet'"
                    :type="store.state.settings.selectedNetwork == 'devnet' ? 'success' : 'tertiary'"
                  >
                    <template #icon>
                      <n-icon><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M15 12h2v18h-2z" fill="currentColor"></path><path d="M11.33 18.22a7 7 0 0 1 0-10.44l1.34 1.49a5 5 0 0 0 0 7.46z" fill="currentColor"></path><path d="M20.67 18.22l-1.34-1.49a5 5 0 0 0 0-7.46l1.34-1.49a7 7 0 0 1 0 10.44z" fill="currentColor"></path><path d="M8.4 21.8a11 11 0 0 1 0-17.6l1.2 1.6a9 9 0 0 0 0 14.4z" fill="currentColor"></path><path d="M23.6 21.8l-1.2-1.6a9 9 0 0 0 0-14.4l1.2-1.6a11 11 0 0 1 0 17.6z" fill="currentColor"></path></svg></n-icon>
                    </template>
                    Devnet
                  </n-button>
                </n-button-group>
                <br/>

                <n-h4 type="primary">API Settings</n-h4>

                <n-input-group >
                  <n-input-group-label>
                    <n-text depth="3" style="font-size: 80%">Node</n-text>
                  </n-input-group-label>
                  <n-input v-model:value="store.state.settings.networks[store.state.settings.selectedNetwork].nodeUrl" type="text" placeholder="Archive graphQLURL" style="font-size: 80%">
                    <template #prefix>
                      <n-icon :color="themeVars.primaryColor">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M7.3 14.7l1.2-1.2c-1-1-1.5-2.3-1.5-3.5c0-1.3.5-2.6 1.5-3.5L7.3 5.3c-1.3 1.3-2 3-2 4.7s.7 3.4 2 4.7zM19.1 2.9l-1.2 1.2c1.6 1.6 2.4 3.8 2.4 5.9c0 2.1-.8 4.3-2.4 5.9l1.2 1.2c2-2 2.9-4.5 2.9-7.1c0-2.6-1-5.1-2.9-7.1z" fill="currentColor"></path><path d="M6.1 4.1L4.9 2.9C3 4.9 2 7.4 2 10c0 2.6 1 5.1 2.9 7.1l1.2-1.2c-1.6-1.6-2.4-3.8-2.4-5.9c0-2.1.8-4.3 2.4-5.9zm10.6 10.6c1.3-1.3 2-3 2-4.7c-.1-1.7-.7-3.4-2-4.7l-1.2 1.2c1 1 1.5 2.3 1.5 3.5c0 1.3-.5 2.6-1.5 3.5l1.2 1.2zM14.5 10a2.5 2.5 0 0 0-5 0c0 .76.34 1.42.87 1.88L7 22h2l.67-2h4.67l.66 2h2l-3.37-10.12c.53-.46.87-1.12.87-1.88zm-4.17 8L12 13l1.67 5h-3.34z" fill="currentColor"></path></svg>
                      </n-icon>
                    </template>
                  </n-input>
                </n-input-group>

                <n-input-group >
                  <n-input-group-label>
                    <n-text depth="3" style="font-size: 80%">Archive</n-text>
                  </n-input-group-label>
                  <n-input v-model:value="store.state.settings.networks[store.state.settings.selectedNetwork].graphQLURL" type="text" placeholder="Archive graphQLURL" style="font-size: 80%">
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
                  <n-input v-model:value="store.state.settings.networks[store.state.settings.selectedNetwork].blockExplorer" type="text" placeholder="Block explorer" style="font-size: 80%">
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
                  <n-switch v-model:value="store.state.settings.userSignatureOptions.requestUserWalletSignature" />
                </n-flex>

                <n-flex align="center" justify="space-between">
                  <n-popover trigger="hover">
                    <template #trigger>
                      <n-text depth="3" style="font-size: 80%">Request passkeys on proof creation</n-text>
                    </template>
                    <n-text depth="3" style="font-size: 80%">
                      Bind passkey to created proofs
                    </n-text>
                    </n-popover>
                  <n-switch v-model:value="store.state.settings.passkeysOptions.requestPasskeysSignature" />
                </n-flex>

                <br/>
                <n-h4 type="primary">Precompile proofs</n-h4>
                <PrecompileButtons />
              </n-space>
            </div>
          </n-popover>

        </n-space>
      </template>
      <template #footer>
      </template>
    </n-page-header>

      <n-modal v-model:show="showScannerModal">
        <n-card style="max-width: 50em;">
          <n-alert title="What is it for?" type="default" style="font-size: 90%">
            <template #icon>
              <n-icon :color="themeVars.primaryColor">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 12"><g fill="none"><path d="M11 6A5 5 0 1 1 1 6a5 5 0 0 1 10 0zm-5.5.5V8a.5.5 0 0 0 1 0V6.5a.5.5 0 0 0-1 0zM6 3.75a.75.75 0 1 0 0 1.5a.75.75 0 0 0 0-1.5z" fill="currentColor"></path></g></svg>
              </n-icon>
            </template>
            Use this scanner to scan an account ownership challange posed to you by the proof consumer (qr-code).
            Be ready to use the same MINA account the proof was tied to during the creation.
          </n-alert>
          <br/>
          <qrcode-stream 
            @detect="onQrCodeDetect" 
            @errors="console.error" 
            style="max-width: 50em;"
          />
        </n-card>
      </n-modal>

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
  filter: drop-shadow(0em 0em 0.6em v-bind(themeVars.primaryColor));
  transform: scale(1.1);
}

</style>
