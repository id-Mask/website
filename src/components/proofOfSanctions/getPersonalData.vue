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

    <n-space vertical>
      <n-text type="default">
        Streamline your personal identification data
      </n-text>
      <n-text :depth="3" style="font-size: 90%">
        <p>
          The data must include your name, surname and personal identification number which also includes your birthdate.
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
      <n-spin :show="data.isLoading">
        <n-card v-if="data.pid">
          <template #action>
            <n-space justify="end">
              <n-button strong secondary type="tertiary" size="small" @click="data.blurData = !data.blurData">
                {{ data.blurData ? 'show' : 'hide' }}
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
