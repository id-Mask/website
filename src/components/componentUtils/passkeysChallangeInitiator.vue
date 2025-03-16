<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useThemeVars } from 'naive-ui'
import { parseSignatureHex, parsePayloadHex, base64urlToBuffer } from '../proofSteps/utils/passkeysUtils.js' 
import * as ox from 'ox'

const props = defineProps({
  publicKeyHex: String,
  passkeysID: String,
})

const store = useStore()
const themeVars = useThemeVars()
const assertion = ref(null)
const passkeysSignatureVerified = ref(null)
const qrCodeUrl = ref(null)
const INTERVAL = 2500
let interval = null // this is to stop requests after unmount or proper response


const verifyAssertion = async () => {
  const publicKeyHex = props.publicKeyHex
  const payloadHex = await parsePayloadHex(
    base64urlToBuffer(assertion.value.response.clientDataJSON), 
    base64urlToBuffer(assertion.value.response.authenticatorData)
  )
  const signatureHex = parseSignatureHex(assertion.value.response.signature)

  const isValid = ox.P256.verify({
    hash: false,
    publicKey: ox.PublicKey.fromHex(publicKeyHex),
    payload: ox.Bytes.fromHex(payloadHex),
    signature: ox.Signature.fromHex(signatureHex),
  })
  if (isValid) {
    passkeysSignatureVerified.value = true
  }
}


const initSession = async () => {
  const url = store.state.settings.zkOracle

  // init session
  const initSessionResponse = await fetch(url + 'passkeys/createChallengeSession', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  const initSessionResponse_ = await initSessionResponse.json()
  console.log(initSessionResponse_)
  
  // create the qr code
  const baseUrl = window.location.origin;
  const path = '/passkeysChallengePage';
  const query = `?challenge=${initSessionResponse_.challenge}&rawId=${props.passkeysID}`;
  qrCodeUrl.value = `${baseUrl}${path}${query}`;

  const getSignatureForChallenge = async (challenge) => {

    const url = store.state.settings.zkOracle
    const response = await fetch(`${url}passkeys/getAssertion?request=${challenge}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json()
      console.log(data)

      // stop sending requests if got proper response
      if (Object.keys(data).length > 0) {
        clearInterval(interval);
        interval = null;

        // save assertion
        assertion.value = data
        await verifyAssertion()
        console.log(assertion.value)
      }
    }
  }

  // repeat requests until proper response
  interval = setInterval(() => getSignatureForChallenge(initSessionResponse_.challenge), INTERVAL)

}

onMounted(async () => {
  await initSession()
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
});

</script>

<template>
  <n-divider />
  <n-space vertical align="center">

    <n-text strong>verify passkey</n-text>

    <n-skeleton :width="174" :height="174" :sharp="false" v-if="!qrCodeUrl"/>
    <a class="qr-container" v-else :href="qrCodeUrl" target="_blank" >
      <n-qr-code 
        :value="qrCodeUrl" 
        icon-src="https://avatars.githubusercontent.com/u/144892177?s=200&v=4" 
        :icon-background-color="themeVars.primaryColor" 
        :size="150" 
      />
      <span v-if="passkeysSignatureVerified !== null" class="qr-overlay">
        {{ passkeysSignatureVerified ? '✅' : '❌' }}
      </span>
    </a>

  </n-space>
</template>

<style scoped>

.qr-container {
  position: relative;
  display: inline-block;
}

.qr-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem; /* Adjust emoji size */
  background: rgba(255, 255, 255, 0.90); /* Optional: Add contrast */
  padding: 3.2rem;
  pointer-events: none;
}

</style>
