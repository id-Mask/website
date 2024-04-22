<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Signature, PublicKey, Field } from 'o1js'

const props = defineProps({
  publicKey: String,
})

const store = useStore()
const signatureJSON = ref(null)
const qrCodeUrl = ref(null)
const INTERVAL = 2000
const publicKeysMatch = ref(null)
const isLoading = ref(true)
const text = ref('initiating session')

const initSession = async (publicKey) => {
  const url = store.state.settings.zkOracle

  // init session
  const initSessionResponse = await fetch(url + 'createOwnershipSession', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  const initSessionResponse_ = await initSessionResponse.json()
  qrCodeUrl.value = `http://localhost:5173/proofOwnershipValidation?sessionId=${initSessionResponse_.sessionId}`
  text.value = 'waiting for user to verify ownership'

  const getSignatureFromSession = async (session) => {
    const response = await fetch(url + 'getSignatureFromOwnershipSession', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(session),
    })
    if (response.status === 200) {
      const data = await response.json()
      if ('r' in data) {
        clearInterval(interval) // Stop the interval
        signatureJSON.value = data

        // verify signature
        const signature = Signature.fromJSON(data)
        const publicKey_ = PublicKey.fromBase58(publicKey)
        console.log(publicKey_)
        const isValid = signature.verify(publicKey_, String(session.sessionId).split('').map(i => Field(i)))
        console.log(isValid.toBoolean())
        publicKeysMatch.value = isValid.toBoolean()
        isLoading.value = false
        text.value = 'verified!'
      }
    }
  }

  // get signature
  await getSignatureFromSession(initSessionResponse_)
  const interval = setInterval(() => getSignatureFromSession(initSessionResponse_), INTERVAL)

}

onMounted(async () => {
  await initSession(props.publicKey)
})

</script>

<template>
  <n-space vertical align="center">
    <n-qr-code :value="qrCodeUrl" v-if="qrCodeUrl" />
    <n-text tag="a" target="_blank" :href="qrCodeUrl">verification url</n-text>
    <n-text :depth="3">{{ text }}</n-text>
    <n-spin v-show="isLoading" size="small"/>
    <n-text style="font-size: 4em;" v-if="publicKeysMatch">✅</n-text>
    <n-text style="font-size: 4em;" v-if="(publicKeysMatch !== null) && (!publicKeysMatch)">❌</n-text>
  </n-space>
</template>

<style>

</style>
