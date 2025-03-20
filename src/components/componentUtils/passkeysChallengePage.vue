<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { base64urlToBuffer } from '../proofSteps/utils/passkeysUtils.js'
import { useMessage } from 'naive-ui'

const urlParams = ref({})
const store = useStore()
const isFinished = ref(false)
const isLoading = ref(true)
const message = useMessage()

const getUrlParams = () => {
  const url = window.location.href
  // Use a regular expression to match parameters in the URL
  const paramsRegex = /[?&]([^=#]+)=([^&#]*)/g
  const params = {}
  let match
  // Loop through matches and extract parameters
  while ((match = paramsRegex.exec(url))) {
    params[match[1]] = decodeURIComponent(match[2].replace(/\+/g, ' '))
  }
  return params;
};

const postAssertion = async (challenge, assertion) => {
  const url = store.state.settings.zkOracle
  const data = {
    challenge: challenge,
    assertion: assertion,
  }
  const response = await fetch(url + 'passkeys/postAssertion', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
  return response
}

const getAssertion = async (rawId) => {
  const publicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from(urlParams.value.challenge, c => c.charCodeAt(0)),
    allowCredentials: [{
      type: 'public-key',
      id: base64urlToBuffer(rawId),
      transports: [],
    }],
    userVerification: 'preferred',
  };
  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialCreationOptions
  });

  return credential
}

const startClosingCounter = async () => {
  let remainingTime = 5;
  console.log('create')
  const msg = message.info(`Closing in ${remainingTime}s`, { duration: 5000 });

  const interval = setInterval(() => {
    remainingTime--;
    console.log(remainingTime)
    msg.content = `Closing in ${remainingTime}s` // Proper way to update Ant Design message
    if (remainingTime === 0) {
      console.log('inner')
      clearInterval(interval);
      window.close();
    }
  }, 1000);
};

onMounted(async () => {
  urlParams.value = getUrlParams()
  const credential = await getAssertion(urlParams.value.rawId)
  const response = await postAssertion(urlParams.value.challenge, credential)
  console.log(response)
  if (response.status == 200) {
    isFinished.value = true
    await startClosingCounter()
  }
})

</script>

<template>
  <n-layout>
    <n-flex justify="center" style="height: 100vh;">
      <n-flex justify="center" style="text-align: center;" vertical>
      <div v-if="!isFinished">
        <n-card style="max-width: 500px;" hoverable>
          <n-text style="font-size: 8em;">🎒</n-text>
          <br>
          <n-text :depth="2" style="font-size: 1.5em;">Please verify your ownership of the proof</n-text>
          <br><br>
          <n-text :depth="3">You will be signing a challenge using your passkeys</n-text>
          <br><br>
          <n-text :depth="3">{{ urlParams }}</n-text>
          <br><br>
          <n-spin v-if="isLoading" size="small" />
        </n-card>
        </div>
        <div v-else>
          <n-text style="font-size: 8em;">✅</n-text>
          <br>
          <n-text :depth="2" style="font-size: 1.5em;">Challenge signed!</n-text>
          <br><br>
          <n-text :depth="3">You're good to go!</n-text>
        </div>
      </n-flex>
    </n-flex>
  </n-layout>
</template>

<style>

</style>
