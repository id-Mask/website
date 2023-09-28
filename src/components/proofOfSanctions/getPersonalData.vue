<script setup>
import { reactive, ref, onMounted, watch, defineEmits } from 'vue'
import { useThemeVars } from 'naive-ui'

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
  blurData: true
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
      <n-text :depth="3" style="font-size: 90%">
        <p>
          The data will include your name, surname and personal identification number which also includes your birthdate.
          In the next steps, you will use this data to check against OFAC sanctions database.
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
      <n-input-group v-if="data.selectedSource == 'Smart-ID'">
        <n-button type="primary">
          Get data
        </n-button>
        <n-input
          v-model:value="data.personalIdentificationNumber"
          placeholder="Personal Identification Number"
        />
      </n-input-group>
      <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
        <n-card v-if="data.pid">
          <template #action>
            <n-space justify="space-between" align="start">
              <n-tag :bordered="false" size="small" :style="'border-radius:' + themeVars.borderRadius">
                <!-- <template #icon>
                  <n-icon :color="themeVars.primaryColor">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M18 30h-4a2 2 0 0 1-2-2v-7a2 2 0 0 1-2-2v-6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a2 2 0 0 1-2 2v7a2 2 0 0 1-2 2zm-5-18a.94.94 0 0 0-1 1v6h2v9h4v-9h2v-6a.94.94 0 0 0-1-1z" fill="currentColor"></path><path d="M16 9a4 4 0 1 1 4-4a4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2a2 2 0 0 0-2-2z" fill="currentColor"></path></svg>
                  </n-icon>
                </template> -->
                <n-text :depth="3">
                  Your personal id data:
                </n-text>
              </n-tag>
              <!-- <span>
                <n-text depth="3">
                  Your personal id data:
                </n-text>
              </span> -->
              <n-button strong secondary type="tertiary" size="small" @click="data.blurData = !data.blurData">
                <template #icon>
                  <n-icon :size="20">
                    <svg v-if="data.blurData" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M12 19c-4 0-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7c-.42.736-.858 1.414-1.311 2.033"></path><path d="M15 19l2 2l4-4"></path></g></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512C791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 0 0 0-51.5zm-63.57-320.64L836 122.88a8 8 0 0 0-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 0 0 0 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 0 0 0 11.31L155.17 889a8 8 0 0 0 11.31 0l712.15-712.12a8 8 0 0 0 0-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 0 0-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 0 1 146.2-106.69L401.31 546.2A112 112 0 0 1 396 512z" fill="currentColor"></path><path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 0 0 227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 0 1-112 112z" fill="currentColor"></path></svg>
                  </n-icon>
                </template>
              </n-button>
            </n-space>
            <n-scrollbar x-scrollable>
              <n-code :code="JSON.stringify(data.pid, null, 2)" :hljs="hljs" language="json" class="code" :class="data.blurData ? 'blur' : ''" style="white-space: nowrap;"/>
            </n-scrollbar>
          </template>
        </n-card>
      </n-spin>
    </n-space>

</template>

<style scoped>

.code {
  font-family: "JetBrains Mono";
  font-size: 90%;
}

.hljs-key {
  color: #5F5FEAFF !important;
}
.hljs-string {
  color: #5F5FEAFF !important;
}

.blur {
  filter: blur(3px);
  -webkit-filter: blur(3px);
}

</style>
