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
import { PersonalData, CreatorAccount } from './../zkPrograms/proof.utils.js'
import { PersonalSecretValue } from './../zkPrograms/ProofOfUniqueHuman.utils.js'
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

const getSecreteValue = async () => {
  const url = store.state.settings.zkOracle
  const response = await fetch(url + 'uniqueHuman/getSecretValue', {
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

  // preparations
  const personalData = new PersonalData({
    ...store.state.pid.data.data,
    publicKey: store.state.pid.data.publicKey,
    signature: store.state.pid.data.signature,
  })

  let msg = message.create('1/4 Crafting your signature 🤫🔐', { type: 'loading', duration: 10e9 })
  const creatorAccountParams = await generateCreatorAccountSignature(
    personalData.toFields(), 
    store.state.settings.userSignatureOptions
  )
  const creatorAccount = new CreatorAccount(creatorAccountParams);

  const passkeys = await setupPasskeys()
  message.create(
    'Passkeys are ready to be linked to your proof',
    { type: 'success', duration: 10000, closable: true }
  )

  msg.content = '2/4 Crafting your secrets 🤫🔐'
  const secretValueParams = await getSecreteValue()
  const personalSecret = new PersonalSecretValue({
    secret: secretValueParams.data.secret,
    signature: secretValueParams.signature,
    publicKey: secretValueParams.publicKey,
  })

  if (store.state.settings.consoleDebugMode) {
    console.log('Your secrets:', secretValueParams)
  }

  // start loading bars
  store.state.proofs.isLoading = true
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  msg.content = '3/4 Compiling zkProgam 🛠️ (this might take quite some time)'
  await compile(store, props.selectedProof, { useCache: store.state.settings.useCache })

  msg.content = "4/4 Creating the proof 🌈✨"
  try {
    console.time('running prove method');
    const proof = await proofWorker.proveUniqueHuman(
      personalData.toJSON(),
      personalSecret.toJSON(),
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
    msg.content = "Something is wrong. Sorry 🤔"
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
        You will transform your personal data into a special key, confirming you're truly one of a kind.
      </p>
    </n-text>

    <n-button type="primary" @click="createProof()" :loading="data.isLoading" :disabled="store.state.proofs.isLoading">
      Create proof
    </n-button>
  </n-space>

  <PasskeysModal />

</template>

<style>

</style>
