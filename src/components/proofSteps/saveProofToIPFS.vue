<script setup>
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'

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

const store = useStore()
const themeVars = useThemeVars()

const props = defineProps({
  selectedProof: String,
})

const isLoading = ref(false)
const showModal = ref(false)

const randomKey = ref(null)
const encryptedProof = ref(null)
const ipfsData = ref(null)
const walletData = ref(null)

// 1. generate random key to be used in encryption and let the user confirm it
const generateRandomKey = (length) => {
  const chars = 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_?'
    const charLength = chars.length
    let randomKey = ''
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * charLength)
      randomKey += chars.charAt(idx)
    }
    return randomKey
}

const encryptProof = async () => {
  const proofJson =  store.state.proofs.data[props.selectedProof].proof
  console.log(proofJson)

  // encrypt
  var encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(proofJson), 
    randomKey.value
  ).toString()
  console.log('encrypted: ', encryptedData)

  // decrypt
  var bytes  = CryptoJS.AES.decrypt(encryptedData, randomKey.value)
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  console.log('decripted: ', decryptedData)

  // save
  encryptedProof.value = encryptedData
}

const saveProofToIPFS = async () => {
  const pinataApiKey = '46d4dc957cbe22bd9c3e'
  const  pinataSecretApiKey = '9fdfa869319035a3682f3ca4770ebe342805f94e12329f28e5d82393a91b8d08'
  const response = await fetch('https://api.pinata.cloud/pinning/pinJsonToIPFS', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json', 
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    },
    body: JSON.stringify({pinataContent: encryptedProof.value})
  })
  const response_ = await response.json()
  ipfsData.value = response_
}

const getWalletData = async () => {
  const data = {
    cid: ipfsData.value.IpfsHash,
    secretKey: randomKey.value,
    proof: props.selectedProof,
  }
  console.log(data)
  walletData.value = data
  return data
}


const initSaveProofToIPFS = async () => {
  randomKey.value = generateRandomKey(32)
  console.log('secretKey', randomKey.value)
  showModal.value = true
}

</script>

<template>
  <n-button @click="initSaveProofToIPFS()" :loading="isLoading" type="primary">
    <template #icon>
      <n-icon :color="themeVars.textColor">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M413.48 284.46c58.87 47.24 91.61 89 80.31 108.55c-17.85 30.85-138.78-5.48-270.1-81.15S.37 149.84 18.21 119c11.16-19.28 62.58-12.32 131.64 14.09" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"></path><circle cx="256" cy="256" r="160" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"></circle></svg>
      </n-icon>
    </template>
    Save to IPFS
  </n-button>

  <n-modal v-model:show="showModal">
    <n-card
      style="width: 400px"
      title="🪐 Save to IPFS (later on to be put to google / android wallet)"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-h4>Secret key used to encrypt proof before storing it on IPFS</n-h4>
      <n-input v-model:value="randomKey" type="text" placeholder="random key" />

      <n-h4>Encrypted proof</n-h4>
      <n-input v-model:value="encryptedProof" type="text" placeholder="cipher proof" disabled/>

      <n-h4>IPFS data</n-h4>
      <n-text style="font-size: 90%">{{ ipfsData }}</n-text>
      
      <n-h4>Data to be stored on wallet</n-h4>
      <n-text style="font-size: 90%">{{ walletData }}</n-text>

      <br><br>
      <n-button @click="encryptProof">encrypt proof</n-button>
      <n-button @click="saveProofToIPFS">save proof to IPFS</n-button>
      <n-button @click="getWalletData">get wallet data</n-button>
    </n-card>
  </n-modal>

</template>

<style>

</style>
