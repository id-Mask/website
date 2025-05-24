<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import { generateCreatorAccountSignature, isWalletAvailable } from './utils/walletUtils.js'
import {
  CircuitString,
  Field,
  Signature,
} from 'o1js'

import { compile } from './compile.js'
import { proofOfNationality } from './../zkPrograms/ProofOfNationality.js'
import { PersonalData } from './../zkPrograms/proof.utils.js'

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

  // prepare personal data
  const pid = store.state.pid.data
  const personalData = new PersonalData({
    name: CircuitString.fromString(pid.data.name),
    surname: CircuitString.fromString(pid.data.surname),
    country: CircuitString.fromString(pid.data.country),
    pno: CircuitString.fromString(pid.data.pno),
    currentDate: Field(pid.data.currentDate),
    isMockData: Field(pid.data.isMockData),
  })

  // Craft the signature of the data using wallet or default creds
  let msg = message.create('1/3 Crafting your signature 🤫🔐', { type: 'loading', duration: 10e9 })
  const [creatorPublicKey, creatorDataSignature] = await generateSignature(
    personalData.toFields(), 
    store.state.settings.userSignatureOptions
  )

  // generate passkeys signature
  const passkeysParams = await setupPasskeys()
  message.create(
    'Success: your passkeys are set up and ready to be linked to your proof',
    { type: 'success', duration: 10000, closable: true }
  )

  // start loading bars
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  msg.content = "2/3 Compiling zkProgam 🛠️"
  await compile(store, props.selectedProof, { useCache: store.state.settings.useCache })

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
    const { proof } = await proofOfNationality.proveNationality(
      personalData,
      Signature.fromJSON(pid.signature),
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

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">  
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        You will generate a proof confirming your nationality and possession of an ID issued by your respective nation.
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
