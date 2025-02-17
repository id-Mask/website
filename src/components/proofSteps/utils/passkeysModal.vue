<script setup>
import { useThemeVars } from 'naive-ui'
import { usePasskeysSetup, showModal } from './passkeysSetup'

const themeVars = useThemeVars()
const { handleChoice } = usePasskeysSetup()

</script>

<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="max-width: 500px; padding-top: 1em; padding-bottom: 2em;" :bordered="false" size="huge">
      <n-space vertical style="text-align: center;">
        <div>
          <n-icon-wrapper :size="48" :border-radius="10" :color="themeVars.pressedColor">
            <n-icon :size="28" :color="themeVars.primaryColor">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M14 14.05V14H4.253a2.249 2.249 0 0 0-2.25 2.25v.919c0 .572.18 1.13.511 1.596C4.056 20.929 6.58 22 10 22c.715 0 1.39-.046 2.026-.14A2.51 2.51 0 0 1 12 21.5v-5a2.5 2.5 0 0 1 2-2.45zM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10zM15 15v-1a2.5 2.5 0 0 1 5 0v1h.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-5a1.5 1.5 0 0 1 1.5-1.5h.5zm1.5-1v1h2v-1a1 1 0 1 0-2 0zm2 5a1 1 0 1 0-2 0a1 1 0 0 0 2 0z" fill="currentColor"></path></g></svg>
            </n-icon>
          </n-icon-wrapper>
          <n-text :depth="2" tag="h2">Bind your passkeys to the proof</n-text>
        </div>
        <br/>
        <n-button type="primary" @click="handleChoice('use')">use created</n-button>
        <n-text :depth="2" style="font-size: 90%">Use already created keys if you've created them before</n-text>
        <n-divider>Or</n-divider>
        <n-button type="primary" @click="handleChoice('create')">create new</n-button>
        <n-text :depth="2" style="font-size: 90%">Create new if you've never done this before</n-text>
      </n-space>
    </n-card>
  </n-modal>
</template>