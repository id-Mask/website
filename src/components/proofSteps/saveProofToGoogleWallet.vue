<script setup>
import { ref } from 'vue'
import { useThemeVars, useMessage } from 'naive-ui'
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

const store = useStore()
const themeVars = useThemeVars()
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

  // encrypt
  var encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(proofJson), 
    secret
  ).toString()
  console.log('encrypted: ', encrypted)

  // decrypt
  var bytes  = CryptoJS.AES.decrypt(encrypted, secret)
  var decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  console.log('decripted: ', decrypted)

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
  console.log('proofJson:', proofJson)

  const secret = generateSecret(32)
  console.log('secret:', secret)

  const encryptedProof = encrypt(proofJson, secret)
  console.log('encryptedProof:', encryptedProof)

  msgReactive.content = "2/3 Uploading enrypted proof to IPFS ⬆️"
  const ipfsData = await uploadToIPFS(encryptedProof)
  console.log('ipfsData:', ipfsData)

  msgReactive.content = "3/3 Saving proof to your Google wallet ⬆️"
  // TODO: call the zkOracle  and push this to user's google wallet
  const walletData = {
    ipfs: ipfsData,
    secretKey: secret,
    proof: props.selectedProof,
  }
  console.log('walletData', walletData)

  msgReactive.type = 'success'
  msgReactive.content = "You can now access your proof from within your Google wallet 👛"
  isLoading.value = false
  await sleep(5000)
  message.destroyAll()

}

</script>

<template>
  <n-button @click="save()" :loading="isLoading" type="primary">
    <template #icon>
      <n-icon :color="themeVars.textColor">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M95.5 104h320a87.73 87.73 0 0 1 11.18.71a66 66 0 0 0-77.51-55.56L86 94.08h-.3a66 66 0 0 0-41.07 26.13A87.57 87.57 0 0 1 95.5 104z" fill="currentColor"></path><path d="M415.5 128h-320a64.07 64.07 0 0 0-64 64v192a64.07 64.07 0 0 0 64 64h320a64.07 64.07 0 0 0 64-64V192a64.07 64.07 0 0 0-64-64zM368 320a32 32 0 1 1 32-32a32 32 0 0 1-32 32z" fill="currentColor"></path><path d="M32 259.5V160c0-21.67 12-58 53.65-65.87C121 87.5 156 87.5 156 87.5s23 16 4 16s-18.5 24.5 0 24.5s0 23.5 0 23.5L85.5 236z" fill="currentColor"></path></svg>
      </n-icon>
    </template>
    Save to Google wallet
  </n-button>
</template>

<style>

</style>
