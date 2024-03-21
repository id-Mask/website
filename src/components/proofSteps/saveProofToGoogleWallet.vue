<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useStore } from 'vuex'
import { sleep } from './../../utils.js'

import * as CryptoJS from 'crypto-js'

/*
  How proofs are stored on apple / android wallet?

  1. encrypt the proof
  2. push it to IPFS
  3. create JSON: {
    proof: proofOfAge,
    cid: IPFS-cid,
    secretKey: secretKey (to decrypt public data on cid)
  } 
  4. store this JSON on apple / andoid wallet 
*/

const emit = defineEmits(['finished'])

const store = useStore()
const message = useMessage()

const props = defineProps({
  selectedProof: String,
})

const isLoading = ref(false)

// generate random key to be used in encryption and let the user confirm it
const generateSecret = (length) => {
  const chars = 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_?'
    const charLength = chars.length
    let secret = ''
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * charLength)
      secret += chars.charAt(idx)
    }
    return secret
}

const encrypt = async (proofJson, secret) => {
  var encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(proofJson), 
    secret
  ).toString()

  /*
    How to decrypt and use this data? To go from `encrypted`
    to `decrypted` do the following:

    var bytes  = CryptoJS.AES.decrypt(encrypted, secret)
    var decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  */

  return encrypted
}

const uploadToIPFS = async (data) => {
  const url = store.state.settings.zkOracle + 'uploadToIPFS'
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({data: data})
  })
  const response_ = await response.json()
  return response_
}


const save = async () => {

  isLoading.value = true
  let msgReactive = message.create('1/3 Preparing proof 🛠️', { type: 'loading', duration: 10e9 })

  const proofJson = store.state.proofs.data[props.selectedProof].proof
  store.state.settings.consoleDebugMode && console.log('Proof:', proofJson)

  const secret = generateSecret(32)
  store.state.settings.consoleDebugMode && console.log('Encryption secret:', secret)


  const encryptedProof = await encrypt(proofJson, secret)
  store.state.settings.consoleDebugMode && console.log('Encrypted proof:', encryptedProof)

  msgReactive.content = "2/3 Uploading enrypted proof to IPFS ⬆️"
  const ipfsData = await uploadToIPFS(encryptedProof)
  store.state.settings.consoleDebugMode && console.log('IPFS:', ipfsData)

  msgReactive.content = "3/3 Saving proof to your Google wallet ⬆️"

  const walletData = {
    ipfs: ipfsData,
    secretKey: secret,
    proof: props.selectedProof,
  }
  store.state.settings.consoleDebugMode && console.log('Wallet data:', walletData)

  const url = store.state.settings.zkOracle + 'createGoogeWalletPass'
  const identifier = generateSecret(12).replace(/[^a-zA-Z0-9]/g, '')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({identifier: identifier, data: walletData})
  })
  const response_ = await response.json()
  const googleWalletUrl = `https://pay.google.com/gp/v/save/${response_.token}`
  window.open(googleWalletUrl, '_blank')

  msgReactive.type = 'success'
  msgReactive.content = "You can now access your proof from within your Google wallet 👛"

  isLoading.value = false
  emit('finished')

  await sleep(5000)
  message.destroyAll()

}

</script>

<template>
  <!-- <n-spin :show="isLoading" size="tiny"> -->
    <n-button text :loading="isLoading" @click="save()" style="cursor: pointer;">
      <img src="../../assets/google-wallet-badge.png" height="40"/>
    </n-button>
  <!-- </n-spin> -->
</template>

<style>

</style>
