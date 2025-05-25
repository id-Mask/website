<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import {
  Field,
  Bool,
  Signature,
  CircuitString,
} from 'o1js'

import { compile } from './compile.js'
import { proofOfSanctions } from './../zkPrograms/ProofOfSanctions.js'
import { SanctionsData } from './../zkPrograms/ProofOfSanctions.utils.js'
import { PersonalData, CreatorAccount } from './../zkPrograms/proof.utils.js'
import { generateCreatorAccountSignature, isWalletAvailable } from './utils/walletUtils.js'

import PasskeysModal from './utils/passkeysModal.vue'
import { usePasskeysSetup } from './utils/passkeysSetup'

import { getProofWorker } from './utils/proofWorker.singleton.js'

const proofWorker = getProofWorker()
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

const getOFACData = async () => {
  const response = await fetch(store.state.settings.zkOracle + 'sanctions/getOFACmatches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...store.state.pid.data,
      minScore: 95,
    }),
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

  // get ofac data and put it to store
  let msg = message.create('1/4 Verifying your status with OFAC 🌐🕵️‍♀️', { type: 'loading', duration: 10e9 })
  const ofacData = await getOFACData()
  store.state.sanctions.data = ofacData

  if (store.state.settings.consoleDebugMode) {
    console.log('OFAC search results:', ofacData)
  }

  if (ofacData.data.isMatched == 0) {
    message.create(
      'Success: Your data does not match any of the OFAC entries',
      { type: 'success', duration: 10000, closable: true }
    )
  } else {
    message.create(
      'OFAC match found !?',
      { type: 'error', duration: 10000, closable: true }
    )
  }

  // prepare personal data
  const personalData = new PersonalData({
    ...store.state.pid.data.data,
    publicKey: store.state.pid.data.publicKey,
    signature: store.state.pid.data.signature,
  })

  // prepare seanctionsData
  const sanctionsData = new SanctionsData({
    isMatched: ofacData.data.isMatched,
    minScore: ofacData.data.minScore,
    currentDate: ofacData.data.currentDate,
    signature: ofacData.signature,
    publicKey: ofacData.publicKey,
  })

  // generate wallet signature
  msg.content = '2/4 Crafting your signature 🤫🔐'
  const creatorAccountParams = await generateCreatorAccountSignature(
    sanctionsData.toFields(), 
    store.state.settings.userSignatureOptions
  )
  const creatorAccount = new CreatorAccount(creatorAccountParams);

  // generate passkeys signature
  const passkeys = await setupPasskeys()
  message.create(
    'Success: your passkeys are set up and ready to be linked to your proof',
    { type: 'success', duration: 10000, closable: true }
  )

  // start loading bars
  store.state.proofs.isLoading = true
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // compile
  msg.content = "3/4 Compiling zkProgam 🛠️"
  await compile(store, props.selectedProof, { useCache: store.state.settings.useCache })

  msg.content = "4/4 Creating the proof 🌈✨"
  try {

    console.time('running prove method');
    const proof = await proofWorker.proveSanctions(
      sanctionsData.toJSON(),
      personalData.toJSON(),
      creatorAccount.toJSON(),
      passkeys.toJSON(),
    );
    console.timeEnd('running prove method');

    data.value.proof = JSON.stringify(proof, null, 2)

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: proof })
    emit('isLoading', false)
    emit('finished')
    emit('triggerNextStep')

    if (store.state.settings.consoleDebugMode) {
      console.log('Created proof:', proof)
    }

  } catch (error) {
    console.error(error);
    msg.type = 'error'
    msg.content = "Something is wrong. You sure you are not sanctioned? 💀"
  } finally {
    store.state.proofs.isLoading = false
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
        Before starting, you will be checking if your name is on the OFAC list.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="createProof()" :loading="data.isLoading" :disabled="store.state.proofs.isLoading">
        Create proof
      </n-button>
    </n-input-group>
  </n-space>

  <PasskeysModal />

</template>

<style>

</style>
