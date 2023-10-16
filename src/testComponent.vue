<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const updateStore = () => {
  store.dispatch('proofs/saveProof', {proofName: 'testProof', proof: {test: 'test1'}})
}

const getStore = () => {
  console.log(store.getters['proofs/getProofs'])
}

</script>

<template>
  <n-button @click="updateStore()">updateStore</n-button>
  <n-button @click="getStore()">getStore</n-button>
  {{ store.getters['proofs/getProofs'] }}
</template>

<style scoped>
</style>
