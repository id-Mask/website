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

const saveProofToIPFS = async () => {
  const proofJson =  store.state.proofs.data[props.selectedProof].proof
  console.log(proofJson)

  randomKey.value = generateRandomKey(32)
  console.log('secretKey', randomKey.value)

  // encrypt
  var ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(proofJson), 
    randomKey.value
  ).toString()
  console.log('encrypted: ', ciphertext)

  // decrypt
  var bytes  = CryptoJS.AES.decrypt(ciphertext, randomKey.value)
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  console.log('decripted: ', decryptedData)

  showModal.value = true
}

</script>

<template>
  <n-button @click="saveProofToIPFS()" :loading="isLoading" type="primary">
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
      title="🔑 Secret key used to encrypt proof before storing it on IPFS"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-input v-model:value="randomKey" type="text" placeholder="random key" />
    </n-card>
  </n-modal>

</template>

<style>

</style>
