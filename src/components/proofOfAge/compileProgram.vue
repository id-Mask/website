<script setup>
import { ref, onMounted } from 'vue'
import { sleep } from './../../utils.js'

const data = ref({
  verificationKey: null,
  isLoading: false
})

const generateRandomString = (length) => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result;
}

onMounted(async () => {
  data.value.isLoading = true
  await sleep(2000)
  data.value.verificationKey = generateRandomString(500)
  data.value.isLoading = false
})

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Compile the zero-knowledge-powered program in your browser.
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        Before you use the program to produce a proof, we need to get the program into you browser and compile it. That is what we're doing right at this moment.
        No worries, we've already included the program as part of the app, but the compilation step is still necessary.
      </p>
      <p>
        After the program is compled, besides being able to actually run it, it also output a verification key.
        The verification key is not really important right now, but it plays an important role during the verification of the proof you're about to create.
      </p>
    </n-text>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="data.verificationKey || data.isLoading">
        <template #action>
          Verification key: <br><br>
          {{ data.verificationKey }}
        </template>
      </n-card>
    </n-spin>

  </n-space>

</template>

<style>

</style>
