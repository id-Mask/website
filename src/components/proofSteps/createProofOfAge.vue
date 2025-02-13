<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMessage, useThemeVars } from 'naive-ui'
import { sleep } from './../../utils.js'
import { generateSignature, isWalletAvailable } from './walletUtils.js'
import { createPasskeys, usePasskeys } from './passkeysUtils.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

import { compile } from './compile.js'
import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import { 
  PersonalData, 
  PassKeysParams, 
  Secp256r1, 
  EcdsaP256, 
  encodeToAsciiNumber 
} from './../zkPrograms/proof.utils.js'

const themeVars = useThemeVars()
const message = useMessage()
const store = useStore()
const data = ref({
  proof: null,
  isLoading: false,
  ageToProveInYears: null,
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished', 'isLoading', 'triggerNextStep'])

// passkeys helpers
const showPasskeysModal = ref(false)
const passkeysSignature = ref(store.state.settings.passkeysOptions.defaultSignatureValues)
const createPasskeys_ = async () => {
  await createPasskeys()
  await usePasskeys_()
}
const usePasskeys_ = async () => {
  try {
    const passkeysValues = await usePasskeys()
    passkeysSignature.value = new PassKeysParams({
      id: Field(encodeToAsciiNumber(passkeysValues.id)),
      publicKey: Secp256r1.fromHex(passkeysValues.publicKeyHex),
      payload: Secp256r1.Scalar.from(passkeysValues.payloadHex),
      signature: EcdsaP256.fromHex(passkeysValues.signatureHex),
    });
  } catch (error) {
    console.log(error)
  }
  // check if new passkeys are saved and close the modal if so
  if (passkeysSignature.value.id == '0000000000000000000000') {
    showPasskeysModal.value = true
  } else {
    message.create(
      `Pass keys are ready to be bind 🔑`, 
      { type: 'success', closable: false, duration: 4000 }
    )
    showPasskeysModal.value = false
  }
}

// main fn
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

    // throw error if user did not input a value
  if (!(data.value.ageToProveInYears)) {
    message.create(
      `Input the number of years you wish to prove you are older than 🙄`, 
      { type: 'error', closable: true, duration: 20000 }
    )
    return null
  }

  // praparations
  const pid = store.state.pid.data
  const personalData = new PersonalData({
    name: CircuitString.fromString(pid.data.name),
    surname: CircuitString.fromString(pid.data.surname),
    country: CircuitString.fromString(pid.data.country),
    pno: CircuitString.fromString(pid.data.pno),
    currentDate: Field(pid.data.currentDate),
  })

  // generate wallet signature
  const [creatorPublicKey, creatorDataSignature] = await generateSignature(
    personalData.toFields(), 
    store.state.settings.userSignatureOptions
  )

  // generate passkeys signature
  if (store.state.settings.passkeysOptions.requestPasskeysSignature) {
    await usePasskeys_()
  } else {
    passkeysSignature.value = new PassKeysParams({
      id: Field(encodeToAsciiNumber(store.state.settings.passkeysOptions.defaultSignatureValues.id)),
      publicKey: Secp256r1.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.publicKeyHex),
      payload: Secp256r1.Scalar.from(store.state.settings.passkeysOptions.defaultSignatureValues.payloadHex),
      signature: EcdsaP256.fromHex(store.state.settings.passkeysOptions.defaultSignatureValues.signatureHex),
    });
  }

  // start loading bars
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // compile
  let msg = message.create('1/2 Compiling zkProgam 🧩🔨', { type: 'loading', duration: 10e9 })
  await compile(store, props.selectedProof, { useCache: store.state.settings })

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

  msg.content = "2/2 Creating the proof 🌈✨"
  try {
    const { proof } = await proofOfAge.proveAge(
      Field(data.value.ageToProveInYears),
      personalData,
      Signature.fromJSON(pid.signature),
      creatorDataSignature,
      creatorPublicKey,
      passkeysSignature.value,
    );

    const jsonProof = proof.toJSON()
    data.value.proof = JSON.stringify(jsonProof, null, 2)

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })
    emit('isLoading', false)
    emit('finished')

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"
    emit('triggerNextStep')

    if (store.state.settings.consoleDebugMode) {
      console.log('Created proof:', jsonProof)
    }

  } catch (error) {
    console.error(error);
    msg.type = 'error'
    msg.content = "Something is wrong. You sure you are old enough? 👵🏼"
  } finally {
    data.value.isLoading = false
    emit('isLoading', false)
    await sleep(10000)
    message.destroyAll()
  }
}

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        Input the number of years you wish to prove you are older than.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="createProof()" :loading="data.isLoading">
        Create proof
      </n-button>
      <n-input-number
        v-model:value="data.ageToProveInYears"
        placeholder="number of years"
        style="max-width: 14em;"
        min="1"
      />
    </n-input-group>

  </n-space>

  <n-modal v-model:show="showPasskeysModal" mask-closable=false>
    <n-card
      style="max-width: 500px; padding-top: 1em; padding-bottom: 2em;"
      :bordered="false"
      size="huge"
    >
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
      <n-button type="primary" @click="usePasskeys_()">use created</n-button>
      <n-text :depth="2" style="font-size: 90%">Use already created keys if you've created thenm before</n-text>
      <n-divider>Or</n-divider>
      <n-button type="primary" @click="createPasskeys_()">create new</n-button>
      <n-text :depth="2" style="font-size: 90%">Create new if you've never done this before</n-text>
      
    </n-space>
    </n-card>
  </n-modal>

</template>

<style>

</style>
