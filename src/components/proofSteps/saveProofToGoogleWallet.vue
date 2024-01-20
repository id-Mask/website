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
  // console.log('proofJson:', proofJson)

  const secret = generateSecret(32)
  // console.log('secret:', secret)

  const encryptedProof = encrypt(proofJson, secret)
  // console.log('encryptedProof:', encryptedProof)

  msgReactive.content = "2/3 Uploading enrypted proof to IPFS ⬆️"
  const ipfsData = await uploadToIPFS(encryptedProof)
  // console.log('ipfsData:', ipfsData)

  msgReactive.content = "3/3 Saving proof to your Google wallet ⬆️"

  const walletData = {
    ipfs: ipfsData,
    secretKey: secret,
    proof: props.selectedProof,
  }
  // console.log('walletData', walletData)

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
  await sleep(5000)
  message.destroyAll()

}

</script>

<template>
  <n-spin :show="isLoading" size="tiny">
    <n-thing @click="save()" style="cursor: pointer;">
      <img width="200" src="../../assets/google-wallet-button.png" />
    </n-thing>
  </n-spin>
</template>

<style>

</style>
