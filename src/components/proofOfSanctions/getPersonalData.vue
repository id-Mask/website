<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import hidableDataWindow from './../componentUtils/hidableDataWindow.vue'

// hljs stuff
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

const emit = defineEmits(['finished'])

const props = defineProps({
  selectedProof: String,
})

const store = useStore()
const themeVars = useThemeVars()
const verificationCodeModal = ref({
  show: false,
  verificationCode: null,
})

const data = reactive({
  sources:  [
    { name: 'Smart-ID' },
    { name: 'Mock-service' }
  ],
  selectedSource: null,
  selectedCountry: null,
  personalIdentificationNumber: null,
  isLoading: false,
  pid: '',
})

const getSmartIDPID = async () => {
  const sessionData = await fetch("https://smart-id-oracle-2qz4wkdima-uc.a.run.app/initiateSession", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pno: data.personalIdentificationNumber,
      country: data.selectedCountry,
      displayText: '🙋, this is idMask requesting your data 🙌'
    }),
  })
  const sessionData_ = await sessionData.json()

  // show modal with verification code
  verificationCodeModal.value.show = true
  verificationCodeModal.value.verificationCode = sessionData_.verificationCode

  const response = await fetch("https://smart-id-oracle-2qz4wkdima-uc.a.run.app/getData", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData_),
  })
  const response_ = await response.json()

  verificationCodeModal.value.show = false
  return response_
}

const getMockPID = async () => {
  const response = await fetch("https://smart-id-oracle-2qz4wkdima-uc.a.run.app/getSmartIDMockData", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return await response.json()
}

const getPID = async () => {
    data.isLoading = true
    let response = null

    switch (data.selectedSource) {
      case 'Mock-service':
        response = await getMockPID()
        break;
      case 'Smart-ID':
        response = await getSmartIDPID()
        break;
      default:
        console.log(`Sorry, we are out of ${data.selectedSource}.`)
    }

    data.isLoading = false
    emit('finished')
    store.dispatch('pid/saveData', response)
    data.pid = response
}

watch(() => data.selectedSource, async (_selectedSource) => {
  // trigger on click (needed because it'r radio, not a button)
  if (_selectedSource == 'Mock-service') {
    await getPID()
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
      <n-radio-group v-model:value="data.selectedSource" :disabled="data.isLoading">
        <n-radio-button
          v-for="source in data.sources"
          :value="source.name"
          :label="source.name"
        />
      </n-radio-group>
      <n-collapse-transition :show="data.selectedSource == 'Smart-ID'">
        <n-input-group>
          <n-button type="primary" @click="getPID()">
            Get data
          </n-button>
          <n-select
            placeholder=""
            :options="[
              {
                label: 'EE',
                value: 'EE',
              },
              {
                label: 'LV',
                value: 'LV',
              },
              {
                label: 'LT',
                value: 'LT',
              }
            ]"
            v-model:value="data.selectedCountry"
            style="width: 80px;"
          />
          <n-input-number
            style="width: 100%"
            v-model:value="data.personalIdentificationNumber"
            placeholder="Personal Identification Number"
            :show-button="false"
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

    <n-modal v-model:show="verificationCodeModal.show" :mask-closable="false">
      <n-card
        style="max-width: 270px"
        title="Verification Code"
        :bordered="true"
      >
        <n-space justify="center">
        <n-p :depth="3">
          Make sure the verification code does match!
        </n-p>
        <n-h1>
          <n-text type="primary">
            {{ verificationCodeModal.verificationCode }}
          </n-text>
        </n-h1>
      </n-space>
      </n-card>
    </n-modal>

</template>

<style scoped>

</style>
