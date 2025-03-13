<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  publicKeyHex: String,
  passkeysID: String,
})

const store = useStore()
const qrCodeUrl = ref(null)
const INTERVAL = 2500
let interval = null // this is to stop requests after unmount or proper response


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
      console.log('ASSERTION OBJECT', data)

      // stop sending requests if got proper response
      if (Object.keys(data).length > 0) {
        clearInterval(interval);
        interval = null;
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
    <n-qr-code :value="qrCodeUrl" v-if="qrCodeUrl" :size="150"/>
    <a :href="qrCodeUrl" target="_blank">url</a>
  </n-space>
</template>

<style>

</style>
