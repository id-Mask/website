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
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M10 16V8a2 2 0 0 1 2-2h9V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-1h-9a2 2 0 0 1-2-2zm3-8c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h9V8h-9zm3 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="currentColor"></path></svg>
      </n-icon>
    </template>
    Save to Google wallet
  </n-button>
</template>

<style>

</style>
