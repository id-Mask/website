<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

import { compile } from './compile.js'
import { proofOfUniqueHuman } from './../zkPrograms/ProofOfUniqueHuman.js'
import { PersonalData } from './../zkPrograms/proof.utils.js'
import { generateSignature, isWalletAvailable } from './utils/walletUtils.js'

import PasskeysModal from './utils/passkeysModal.vue'
import { usePasskeysSetup } from './utils/passkeysSetup'

const message = useMessage()
const store = useStore()
const data = ref({
  proof: null,
  isLoading: false,
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished', 'isLoading', 'triggerNextStep'])

const { setupPasskeys } = usePasskeysSetup()

const getSecreteValue = async () => {
  const url = store.state.settings.zkOracle
  const response = await fetch(url + 'getSecretValueOfIdentity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store.state.pid.data),
  })
  const response_ = await response.json()
  return response_
}

const createProof = async () => {

  // throw explanation if user needs to sign and does not have a wallet
  if (store.state.settings.userSignatureOptions.requestUserWalletSignature) {
    if (!await isWalletAvailable()) {
      message.create(
        'Mina wallet not available. Please install Auro or Pallad wallet 👛', 
        { type: 'error', closable: true, duration: 20000 }
      )
      return null
    }
  }

  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // preparations
  const pid = store.state.pid.data
  const personalData = new PersonalData({
    name: CircuitString.fromString(pid.data.name),
    surname: CircuitString.fromString(pid.data.surname),
    country: CircuitString.fromString(pid.data.country),
    pno: CircuitString.fromString(pid.data.pno),
    currentDate: Field(pid.data.currentDate),
  })
  const [creatorPublicKey, creatorDataSignature] = await generateSignature(
    personalData.toFields(), 
    store.state.settings.userSignatureOptions
  )
  const passkeysParams = await setupPasskeys()

  let msg = message.create('1/3 Crafting your secrets 🤫🔐', { type: 'loading', duration: 10e9 })
  const secretValue = await getSecreteValue()

  if (store.state.settings.consoleDebugMode) {
    console.log('Your secrets:', secretValue)
  }

  msg.content = "2/3 Compiling zkProgam 🧩🔨"
  await compile(store, props.selectedProof)

  /* pid e.g.:
  const pid = {
    "data": {
      "name": "Douglas",
      "surname": "Lyphe",
      "country": "EE",
      "pno": "PNOEE-67807022776",
      "currentDate": 20231026
    },
    "signature": {
      "r": "24098777140448874930684151839724232933324153889241260987160800793000424886288",
      "s": "26350209170644202625120216193969973021906199319302861651891544714558488811023"
    },
    "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
  }
  */

  msg.content = "3/3 Creating the proof 🌈✨"
  try {
    const { proof } = await proofOfUniqueHuman.proveUniqueHuman(
      personalData,
      Signature.fromJSON(pid.signature),
      CircuitString.fromString(secretValue.data.secret),
      Signature.fromJSON(secretValue.signature),
      creatorDataSignature,
      creatorPublicKey,
      passkeysParams,
    );

    const jsonProof = proof.toJSON()
    data.value.proof = JSON.stringify(jsonProof, null, 2)

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })
    emit('isLoading', false)
    emit('finished')
    emit('triggerNextStep')

    if (store.state.settings.consoleDebugMode) {
      console.log('Created proof:', jsonProof)
    }

  } catch (error) {
    console.error(error);
    msg.type = 'error'
    msg.content = "Something is wrong. Sorry 🤔"
  } finally {
    data.value.isLoading = false
    emit('isLoading', false)
    await sleep(10000)
    message.destroyAll()
  }
}

onMounted(async () => {
})

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">  
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        You will transform your personal data into a special key, confirming you're truly one of a kind.
      </p>
    </n-text>

    <n-button type="primary" @click="createProof()" :loading="data.isLoading">
      Create proof
    </n-button>
  </n-space>

  <PasskeysModal />

</template>

<style>

</style>
