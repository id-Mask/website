<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Signature, Field } from 'o1js'
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

const postSignatureForSession = async (sessionId, signature) => {
  const url = store.state.settings.zkOracle
  const data = {
    sessionId: sessionId,
    signature: signature
  }
  const response = await fetch(url + 'ownership/verify', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
  return response
}

const signMessageAndPostToServer = async () => {
  // const _ = await window.mina.requestAccounts()
  const _ = await window.mina.request({ method: 'mina_accounts' })
  const arrayOfFields = urlParams.value.sessionId.split('').map(i => Field(i))
  const arrayOfStrings = arrayOfFields.map(field => field.toString())
  const signature = await window.mina.signFields({ 
    message: arrayOfStrings
  })
  const signatureJSON = Signature.fromBase58(signature.signature).toJSON()
  const response = await postSignatureForSession(urlParams.value.sessionId, signatureJSON)
  return response
}

onMounted(async () => {
  console.log('proof ownership validation launched')
  urlParams.value = getUrlParams()
  try {
    const response = await signMessageAndPostToServer()
    if (response.ok) {
      isFinished.value = true
      message.success('Sucessfully verified!')
    }
  } catch (error) {
    isLoading.value = false
    message.error(JSON.stringify(error))
  }
})

</script>

<template>
    <n-flex justify="center" style="height: 100vh;">
      <n-flex justify="center" style="text-align: center;" vertical>
      <div v-if="!isFinished">
        <n-card style="max-width: 500px;">
          <n-text style="font-size: 8em;">🎒</n-text>
          <br>
          <n-text :depth="2" style="font-size: 1.5em;">Proof consumer kindly ask you to verify your ownership of the proof</n-text>
          <br><br>
          <n-text :depth="3">Sign the following data using the account you tied your proof to</n-text>
          <br><br>
          <n-text :depth="3">{{ urlParams }}</n-text>
          <br><br>
          <n-spin v-if="isLoading" size="small" />
        </n-card>
        </div>
        <div v-else>
          <n-text style="font-size: 8em;">✅</n-text>
          <br>
          <n-text :depth="2" style="font-size: 1.5em;">Sucessfully verified!</n-text>
          <br><br>
          <n-text :depth="3">You're good to go!</n-text>
        </div>
      </n-flex>
    </n-flex>
</template>

<style>

</style>
