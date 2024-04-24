<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

import { proofOfAge } from '.././zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from '.././zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from '.././zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from '.././zkPrograms/ProofOfNationality.js'

import { compile } from '.././proofSteps/compile.js'

const store = useStore()
const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
  proofOfNationality: proofOfNationality,
}
const isLoading = ref(Object.fromEntries(
  Object.keys(store.state.proofs.data).map(proof => [proof, false])
))

const precompile = async (proofName) => {
  isLoading.value[proofName] = true
  await compile(store, proofName, proofs[proofName], { useCache: true })
  isLoading.value[proofName] = false
}

</script>

<template>
  <n-flex style="max-width: 30em">
    <div v-for="(_, proof) in proofs">
      <n-button 
        @click="precompile(proof)" 
        style="font-size: 80%" 
        secondary 
        :loading="isLoading[proof]"
      >
        <template #icon>
          <span style="font-size: 80%">{{ store.state.proofs.data[proof].emoji }}</span>
        </template>
        {{ store.state.proofs.data[proof].displayName }}
        </n-button>
    </div>
  </n-flex>
</template>
