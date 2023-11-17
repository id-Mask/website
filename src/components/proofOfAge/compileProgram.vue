<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { sleep } from './../../utils.js'

import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './../zkPrograms/ProofOfSanctions.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
}

const store = useStore()
const data = ref({
  isLoading: false
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished'])

const compile = async () => {
  emit('finished', false)
  data.value.isLoading = true
  const hasVk = store.state.proofs.data[props.selectedProof].verificationKey
  if (!hasVk) {
    const { verificationKey } = await proofs[props.selectedProof].compile();
    store.state.proofs.data[props.selectedProof].verificationKey = verificationKey
  }
  data.value.isLoading = false
  emit('finished', true)
}

onMounted(async () => {
  await compile()
})

// watch if selected proof change and compile another proof on select
watch(() => props.selectedProof, async () => {
  await compile()
})

</script>

<template>
  <n-space vertical>
    <n-text type="default">
      Compile the zero-knowledge-powered program in your browser.
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        Before you use the program to produce a proof, you need to get the program into you browser and compile it.
        This step ensures that your data remains secure within the confines of your browser, as the program operates
        directly on your device rather than a remote server. Please be patient as this process may take some time.
        Meanwhile, you can explore the program's
        <a :href="store.state.proofs.data[props.selectedProof].url" target="_blank">source code</a>.
      </p>
      <p>
        After the program is compled, besides being able to actually run it, you also obtain a verification key.
        The verification key is not really important right now, but it plays a key role during the verification of the proof you're about to create.
      </p>
    </n-text>
    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="store.state.proofs.data[props.selectedProof].verificationKey || data.isLoading">
        <template #action>
          Verification key:
          <br><br>
          <n-scrollbar style="max-height: 200px">
            <n-text :depth="3">
              {{ store.state.proofs.data[props.selectedProof].verificationKey }}
            </n-text>
          </n-scrollbar>
        </template>
      </n-card>
    </n-spin>
  </n-space>

</template>

<style>

</style>
