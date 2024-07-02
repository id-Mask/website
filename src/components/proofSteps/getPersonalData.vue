<script setup>
import { reactive, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useStore } from 'vuex'

import { useNotification, NButton } from 'naive-ui'
import { h } from 'vue'

import { parseDOB } from '../../utils.js'

const emit = defineEmits(['finished', 'isLoading', 'triggerNextStep'])

const props = defineProps({
  selectedProof: String,
})

const message = useMessage()
const notification = useNotification()
const notificationLoading = ref(true)
const store = useStore()
const verificationCodeModal = ref({
  show: false,
  verificationCode: null,
})

const data = reactive({
  sources:  [
    { name: 'Smart-ID' },
    { name: 'Mock-ID' }
  ],
  selectedSource: 'Mock-ID',
  selectedCountry: 'EE',
  personalIdentificationNumber: null,
  isLoading: false,
  pid: '',
  inputType: 'text'
})

const getSmartIDPID = async () => {
  const url = store.state.settings.zkOracle
  const sessionData = await fetch(url + 'initiateSession', {
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

  const response = await fetch(url + 'getData', {
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

  notificationLoading.value = true

  const url = store.state.settings.zkOracle
  const response_ = await fetch(url + 'getSmartIDMockData', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const response = await response_.json()

  // create a notification with mock id
  notification.destroyAll()
  notification.create({
    title: "Your random identity 🪪",
    description: "If you don't like this identity you can roll it once again 🎲.",
    content: `
        Name: ${response.data.name}, 
        Surname: ${response.data.surname}, 
        PNO: ${response.data.pno.split('-')[1]}, 
        Date of birth: ${parseDOB(response.data.pno.split('-')[1])}, 
        Country: ${response.data.country}
    `.trim().split('\n').map(line => line.trim()).join('\n'),
    action: () => h(
        NButton,
        {
            type: 'primary',
            loading: notificationLoading.value,
            onClick: async () => {
                await getMockPID();
            }
        },
        {
            default: () => 'Reroll'
        }
    ),
});

  notificationLoading.value = false

  return response
}

const getPID = async () => {

  if ((data.selectedSource == 'Smart-ID') && (!data.personalIdentificationNumber)) {
    message.error('Input your personal identification number')
    return
  }

  emit('isLoading', true)
  data.isLoading = true
  let response = null

  switch (data.selectedSource) {
    case 'Mock-ID':
      response = await getMockPID()
      break;
    case 'Smart-ID':
      response = await getSmartIDPID()
      break;
    default:
      console.log(`Sorry, we are out of ${data.selectedSource}.`)
  }

  data.isLoading = false
  // handle error here:
  if (response.error) {
    message.error(JSON.stringify(response))
    emit('isLoading', false)
    return null
  }

  message.success('Successfully gathered your data! 🎉', { duration: 5000, closable: true })
  emit('isLoading', false)
  emit('finished')
  emit('triggerNextStep')
  store.dispatch('pid/saveData', response)
  data.pid = response

  if (store.state.settings.consoleDebugMode) {
    console.log('Personal data:', response)
  }
}

// this is a hack to make sure the input is not regarded as password
// and explorers do not suggest to save it. This works because on load
// input type is text, and then once the user starts typing it's set to password
watch(() => data.personalIdentificationNumber, (_personalIdentificationNumber) => {
  if (_personalIdentificationNumber.length > 0) {
    data.inputType = 'password'
  }
})

</script>

<template>
    <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">
      <n-text type="default">
        Get your identity data
      </n-text>
      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          Your data will remain securely within your browser, safeguarding your privacy.
        </p>
      </n-text>
      <n-tabs 
        type="segment" 
        v-model:value="data.selectedSource" 
        animated
        size="medium"
      >
        <n-tab-pane name="Mock-ID" tab="Mock-ID">
          <n-input-group>
            <n-button type="primary" @click="getPID()" :loading="data.isLoading">
              Get data
            </n-button>
            <n-popover trigger="hover">
              <template #trigger>
                <n-select
                  value="🏴"
                  style="width: 100px;"
                  disabled
                />
              </template>
              <span style="font-size: 90%; text-align: justify;">
                Disabled, this will return a mock random personal identity data
              </span>
            </n-popover>
            <n-input
              style="width: 100%"
              placeholder="Personal Identification Number"
              disabled
            />
          </n-input-group>
        </n-tab-pane>
        <n-tab-pane name="Smart-ID" tab="Smart-ID">
          <n-input-group>
            <n-button type="primary" @click="getPID()" :loading="data.isLoading">
              Get data
            </n-button>
            <n-select
              :options="[
                {
                  label: '🇪🇪',
                  value: 'EE',
                },
                {
                  label: '🇱🇻',
                  value: 'LV',
                },
                {
                  label: '🇱🇹',
                  value: 'LT',
                }
              ]"
              v-model:value="data.selectedCountry"
              style="width: 100px;"
            />
            <n-input
              style="width: 100%"
              :type="data.inputType"
              show-password-on="mousedown"
              v-model:value="data.personalIdentificationNumber"
              placeholder="Personal Identification Number"
              :show-button="false"
            />
          </n-input-group>
        </n-tab-pane>
        <n-tab-pane name="Ausweisapp" tab="Ausweis-app" disabled></n-tab-pane>
        <!-- <n-tab-pane name="Ausweisapp" tab="zk-Passport" disabled></n-tab-pane> -->
      </n-tabs>
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
