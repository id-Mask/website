<script setup>

import { onMounted } from 'vue'

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { getCacheFiles, FileSystem } from './../utils.js'

onMounted( async () => {

  const cacheFiles = await getCacheFiles('proofOfAge')
  console.time()
  console.log('start compiling')
  await proofOfAge.compile({ cache: FileSystem(cacheFiles) })
  console.timeEnd()
  console.log('complete compiling')

})

</script>

<template>  
</template>

<style>
</style>
