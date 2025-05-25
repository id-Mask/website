<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import { generateCreatorAccountSignature, isWalletAvailable } from './utils/walletUtils.js'

import { compile } from './compile.js'

import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import { PersonalData, CreatorAccount } from './../zkPrograms/proof.utils.js'

import PasskeysModal from './utils/passkeysModal.vue'
import { usePasskeysSetup } from './utils/passkeysSetup'

import { getProofWorker } from './utils/proofWorker.singleton.js'

const proofWorker = getProofWorker()
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

const { setupPasskeys } = usePasskeysSetup()

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
  const personalData = new PersonalData({
    ...store.state.pid.data.data,
    publicKey: store.state.pid.data.publicKey,
    signature: store.state.pid.data.signature,
  })

  // generate wallet signature
  let msg = message.create('1/3 Crafting your signature 🤫🔐', { type: 'loading', duration: 10e9 })
  const creatorAccountParams = await generateCreatorAccountSignature(
    personalData.toFields(), 
    store.state.settings.userSignatureOptions
  )
  const creatorAccount = new CreatorAccount(creatorAccountParams);

  // generate passkeys signature
  const passkeys = await setupPasskeys()
  message.create(
    'Passkeys are ready to be linked to your proof',
    { type: 'success', duration: 10000, closable: true }
  )

  // start loading bars
  store.state.proofs.isLoading = true
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // compile
  msg.content = '2/3 Compiling zkProgam 🛠️ (this might take quite some time)'
  await compile(store, props.selectedProof, { useCache: store.state.settings.useCache })

  msg.content = "3/3 Creating the proof 🌈✨"
  try {
    console.time('running prove method');
    const proof = await proofWorker.proveAge(
      data.value.ageToProveInYears,
      personalData.toJSON(),
      creatorAccount.toJSON(),
      passkeys.toJSON(),
    );
    console.timeEnd('running prove method');

    data.value.proof = JSON.stringify(proof, null, 2)

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: proof })
    emit('isLoading', false)
    emit('finished')

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"
    emit('triggerNextStep')

    if (store.state.settings.consoleDebugMode) {
      console.log('Created proof:', proof)
    }

  } catch (error) {
    console.error(error);
    msg.type = 'error'
    msg.content = "Something is wrong. You sure you are old enough? 👵🏼"
  } finally {
    store.state.proofs.isLoading = false
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
      <n-button type="primary" @click="createProof()" :loading="data.isLoading" :disabled="store.state.proofs.isLoading && !data.isLoading">
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

  <PasskeysModal />

</template>

<style>

</style>
