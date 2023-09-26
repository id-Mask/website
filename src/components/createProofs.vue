<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useThemeVars } from 'naive-ui'

// hljs stuff
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

const themeVars = useThemeVars()

const props = defineProps({
  selectedProof: String,
})

const data = reactive({
  sources:  [
    { name: 'Smart-ID' },
    { name: 'Mock-service' }
  ],
  selectedSource: null,
  personalIdentificationNumber: null,
  isLoading: false,
  pid: ''
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
  return await response.json()
}

watch(() => data.selectedSource, async (_selectedSource) => {
  if (_selectedSource == 'Mock-service') {
    data.pid = await getPID()
  }
})


onMounted( async () => {
  console.log('createProofs mounted')
})

</script>

<template>
  <br>
  <n-card
    :segmented="{ content: true, footer: 'soft' }"
    :header-extra-style="{'align-items': 'start'}"
  >
    <template #header>
      <n-space vertical :size="20">
        <n-space justify="space-between">
          <div>Create {{ props.selectedProof }}</div>
          <div>1/5</div>
        </n-space>
      <n-progress
        style="margin: 0 8px 12px 0"
        type="line"
        :show-indicator="false"
        status="success"
        :percentage="5"
      />
    </n-space>
    </template>
    <template #header-extra>
    </template>
    <n-space vertical>
      <n-text type="default">
        Streamline your personal identification data
      </n-text>
      <n-radio-group v-model:value="data.selectedSource" size="medium" :disabled="data.isLoading">
        <n-radio-button
          v-for="source in data.sources"
          :value="source.name"
          :label="source.name"
        />
      </n-radio-group>
      <n-input-group v-if="data.selectedSource == 'Smart-ID'">
        <n-button type="primary">
          Get data
        </n-button>
        <n-input
          v-model:value="data.personalIdentificationNumber"
          placeholder="Personal Identification Number"
        />
      </n-input-group>
      <n-spin :show="data.isLoading">
        <n-card v-if="data.pid">
          <template #action>
            <n-text>
              <n-code :code="JSON.stringify(data.pid, null, 2)" syle="font-size: 20px" :hljs="hljs" language="json" />
            </n-text>
          </template>
        </n-card>
      </n-spin>
    </n-space>

    <template #footer>
      #footer
    </template>
    <template #action>
      <n-space>
        <n-button tertiary type="primary">
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" fill="currentColor"></path></svg>
            </n-icon>
          </template>
        </n-button>
        <n-button tertiary type="primary">
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4l-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" fill="currentColor"></path></svg>
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<style>

.hljs-key {
  color: #5F5FEAFF !important;
}
.hljs-string {
  color: #5F5FEAFF !important;
}

</style>
