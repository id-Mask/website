<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useThemeVars } from 'naive-ui'
import hidableDataWindow from './../componentUtils/hidableDataWindow.vue'

// hljs stuff
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

const emit = defineEmits(['finished'])

const themeVars = useThemeVars()

const data = reactive({
  sources:  [
    { name: 'Smart-ID' },
    { name: 'Mock-service' }
  ],
  selectedSource: null,
  personalIdentificationNumber: null,
  isLoading: false,
  pid: '',
})

const getPID = async () => {
  data.isLoading = true
  const response = await fetch("https://smart-id-oracle-2qz4wkdima-uc.a.run.app/get_mock_data", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  data.isLoading = false
  emit('finished')
  return await response.json()
}

watch(() => data.selectedSource, async (_selectedSource) => {
  if (_selectedSource == 'Mock-service') {
    data.pid = await getPID()
  }
})

</script>

<template>

    <n-space vertical :size="8">
      <n-text type="default">
        Gather your personal identification data
      </n-text>
      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          The data will include your name, surname and personal identification number which also includes your birthdate.
          In the next steps, you will use this data to create proofs asociated with it.
          Pick your personal identification data streamline service below.
        </p>
      </n-text>
      <n-radio-group v-model:value="data.selectedSource" size="medium" :disabled="data.isLoading">
        <n-radio-button
          v-for="source in data.sources"
          :value="source.name"
          :label="source.name"
        />
      </n-radio-group>
      <n-collapse-transition :show="data.selectedSource == 'Smart-ID'">
        <n-input-group>
          <n-button type="primary">
            Get data
          </n-button>
          <n-input
            v-model:value="data.personalIdentificationNumber"
            placeholder="Personal Identification Number"
          />
        </n-input-group>
      </n-collapse-transition>
      <n-spin :show="data.isLoading" style="padding-top: 1em;">
        <n-card v-if="data.pid || data.isLoading">
          <template #action>
            <hidableDataWindow
              text="Your personal identification data:"
              :data="JSON.stringify(data.pid, null, 2)"
            />
          </template>
        </n-card>
      </n-spin>
    </n-space>

</template>

<style scoped>

</style>
