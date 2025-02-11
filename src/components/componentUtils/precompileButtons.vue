<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useThemeVars } from 'naive-ui'

import { compile } from '.././proofSteps/compile.js'

const themeVars = useThemeVars()
const store = useStore()

const proofs = Object.keys(store.state.proofs.data)

const precompile = async (proofName) => {
  await compile(store, proofName, { useCache: store.state.settings.useCache })
}

</script>

<template>

  <n-flex vertical>

  <n-flex align="center">
    <n-popover trigger="hover">
      <template #trigger>
        <n-text depth="3" style="font-size: 80%">Use cache</n-text>
      </template>
      <n-text depth="3" style="font-size: 80%">
        If consuming the proofs - precompile with no cache
      </n-text>
      </n-popover>
    <n-switch v-model:value="store.state.settings.useCache" />
  </n-flex>

  <n-flex style="max-width: 25em">
    <div v-for="(proof) in proofs">
      <n-button 
        @click="precompile(proof)" 
        style="font-size: 80%" 
        secondary 
        :loading="store.state.proofs.data[proof].isCompiling"
      >
        <template #icon>
          <span style="font-size: 80%">
            <div v-if="store.state.proofs.data[proof].verificationKey">
              <n-icon :color="themeVars.primaryColor">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M20.47 5.63c.39.39.39 1.01 0 1.4L9.13 18.37a.984.984 0 0 1-1.4 0l-4.2-4.2a.984.984 0 0 1 0-1.4a.984.984 0 0 1 1.4 0l3.5 3.5L19.07 5.63a.984.984 0 0 1 1.4 0zm-2.11-2.12l-9.93 9.93l-2.79-2.79c-.78-.78-2.05-.78-2.83 0l-1.4 1.4c-.78.78-.78 2.05 0 2.83l5.6 5.6c.78.78 2.05.78 2.83 0L22.59 7.74c.78-.78.78-2.05 0-2.83l-1.4-1.4c-.79-.78-2.05-.78-2.83 0z" fill="currentColor"></path></svg>
              </n-icon>
            </div>
            <div v-else>
              {{ store.state.proofs.data[proof].emoji }}
            </div>
          </span>
        </template>
        {{ store.state.proofs.data[proof].displayName }}
        </n-button>
    </div>
  </n-flex>
  </n-flex>
</template>
