<script setup>
import { ref, onMounted } from 'vue'
import { sleep } from './../../utils.js'
import { proofOfAge } from './../zkPrograms/ProofOfAge.js'

const data = ref({
  verificationKey: null,
  isLoading: false
})

const emit = defineEmits(['finished'])

onMounted(async () => {
  data.value.isLoading = true
  const { verificationKey } = await proofOfAge.compile();
  data.value.verificationKey = verificationKey.slice(0, 300) + ' ...'
  data.value.isLoading = false
  emit('finished')
})

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Compile the zero-knowledge-powered program in your browser.
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        Before you use the program to produce a proof, we need to get the program into you browser and compile it. That is what is being done right now.
        This usually takes a while, so be ready to wait a bit. In the mean time, you can check out the program
        <a href="https://github.com/id-Mask/smart-contracts/blob/main/src/ProofOfAge.ts" target="_blank">source code</a>.
      </p>
      <p>
        After the program is compled, besides being able to actually run it, we also obtain a verification key.
        The verification key is not really important right now, but it plays a key role during the verification of the proof you're about to create.
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
