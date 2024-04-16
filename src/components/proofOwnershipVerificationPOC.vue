<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { Signature, PublicKey, Field } from 'o1js'

const store = useStore()
const signatureJSON = ref(null)
const qrCodeUrl = ref(null)
const publicKey = 'B62qqgtZqqnDr7BzyNnYguqnHQnpMDyTSEYfWj4r1qkEYcfvszkp8zt'
const INTERVAL = 2000

const verifyPublicKeyOwnership = async (publicKey) => {
  const url = store.state.settings.zkOracle

  // init session
  const initSessionResponse = await fetch(url + 'createOwnershipSession', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  const initSessionResponse_ = await initSessionResponse.json()
  qrCodeUrl.value = 'https://idmask.xyz/verifyPublicKeyOwnership/' + initSessionResponse_.sessionId
  console.log(initSessionResponse_.sessionId)

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
      }
    }
  }

  // get signature
  await getSignatureFromSession(initSessionResponse_)
  const interval = setInterval(() => getSignatureFromSession(initSessionResponse_), INTERVAL)


}

const signMessage = async () => {
  const _ = await window.mina.requestAccounts()
  const arrayOfFields = String(6278505).split('').map(i => Field(i))
  const arrayOfStrings = arrayOfFields.map(field => field.toString())
  const signature = await window.mina.signFields({ 
    message: arrayOfStrings
  })
  console.log(Signature.fromBase58(signature.signature).toJSON())
}

</script>

<template>
  <n-button @click="verifyPublicKeyOwnership(publicKey)">
    re-verify public key ownership
  </n-button>
  {{ signatureJSON }}
  <n-qr-code :value="qrCodeUrl" v-if="qrCodeUrl" />
  <n-button @click="signMessage()">
    Sign message
  </n-button>
</template>

<style>

</style>
