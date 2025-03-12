<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Signature, PublicKey, Field } from 'o1js'

const props = defineProps({
  publicKeyHex: String,
  passkeysID: String,
})

const store = useStore()
const qrCodeUrl = ref(null)
const INTERVAL = 2500
const isLoading = ref(true)
let interval = null // this is to stop requests after unmount

const additionalCheckIfComponentIsMounted = () => {
  return window.location.pathname.contains('passkeysChallangePage')
}

const initSession = async () => {
  const url = store.state.settings.zkOracle

  // init session
  const initSessionResponse = await fetch(url + 'passkeys/createChallangeSession', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  const initSessionResponse_ = await initSessionResponse.json()
  
  const baseUrl = window.location.origin; // Gets the base URL (e.g., https://yourdomain.com)
  const path = '/passkeysChallangePage';
  const query = `?challange=${initSessionResponse_.challange}&rawId=${props.passkeysID}`;
  qrCodeUrl.value = `${baseUrl}${path}${query}`;

  const getSignatureFromSession = async (session) => {

    const url = store.state.settings.zkOracle
    const challange = 'atydeu6v';
    const response = await fetch(`${url}passkeys/getAssertion?request=${challange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json()
      console.log('ASSERTION OBJECT', data)
    }
  }

  // get signature
  await getSignatureFromSession(initSessionResponse_)
  interval = setInterval(() => getSignatureFromSession(initSessionResponse_), INTERVAL)

}

onMounted(async () => {
  // if (additionalCheckIfComponentIsMounted) {
    await initSession()
  // }
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
    <n-qr-code :value="qrCodeUrl" v-if="qrCodeUrl" :size="150"/>
    <a :href="qrCodeUrl" target="_blank">url</a>
  </n-space>
</template>

<style>

</style>
