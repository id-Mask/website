<script setup>
import { sleep } from './../../utils.js'

/*
  How proofs are stored on apple / android wallet?

  1. encrypt the proof
  2. push it to IPFS
  3. create JSON: {
    proof: proofOfAge,
    cid: IPFS-cid,
    secretKey: secretKey (to decrypt public data on cid)
  } 
  4. store this JSON on apple / andoid wallet 
*/

const save = async () => {
  await sleep(5000)
}

</script>

<template>
  <!-- <n-spin :show="isLoading" size="tiny"> -->
    <n-button text disabled>
      <img width="200" src="../../assets/apple-button.png" />
    </n-button>
  <!-- </n-spin> -->
</template>

<style>

</style>
