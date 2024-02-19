<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import {
  Field,
  Bool,
  Signature
} from 'o1js'

import { compile } from './compile.js'
import { proofOfSanctions, PublicInput } from './../zkPrograms/ProofOfSanctions.js'

const message = useMessage()
const store = useStore()
const themeVars = useThemeVars()
const data = ref({
  proof: null,
  isLoading: false,
  ageToProveInYears: null,
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished', 'isLoading', 'triggerNextStep'])

const getOFACData = async () => {
  const response = await fetch(store.state.settings.zkOracle + 'getOFACmatches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...store.state.pid.data,
      minScore: 95,
    }),
  })
  const response_ = await response.json()
  return response_
}

const createProof = async () => {
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // get ofac data and put it to store
  let msg = message.create('1/3 Verifying your status with OFAC 🌐🕵️‍♀️', { type: 'loading', duration: 10e9 })
  const ofacData = await getOFACData()
  store.state.sanctions.data = ofacData

  if (ofacData.data.isMatched == 0) {
    message.create(
      'Success: Your data does not match any of the OFAC entries',
      { type: 'success', duration: 10000, closable: true }
    )
  } else {
    message.create(
      'OFAC match found !?',
      { type: 'error', duration: 10000, closable: true }
    )
  }

  // compile
  msg.content = "2/3 Compiling zkProgam 🧩🔨"
  await compile(store, props.selectedProof, proofOfSanctions)

  /* pid e.g.:
  const ofacData = {
    "data": {
      "isMatched": 0,
      "minScore": 95,
      "currentDate": "2023-11-17"
    },
    "signature": {
      "r": "8385305162155431653982403636492076158195401748235962038052254520261262346192",
      "s": "20488907727414495015698000834244181034194863548194503532107929980174798919322"
    },
    "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN",
    "metaData": {
      "error": false,
      "sourcesUsed": [
        {
          "source": "SDN",
          "publishDate": "11/16/2023"
        }
      ],
      "matches": {
        "Douglas Doe": []
      }
    }
  }
  */

  msg.content = "3/3 Creating the proof 🌈✨"
  try {
    const publicInput = new PublicInput({
      isMatched: Bool(ofacData.data.isMatched),
      minScore: Field(ofacData.data.minScore),
      currentDate: Field(ofacData.data.currentDate),
    })
    const proof = await proofOfSanctions.proveSanctions(
      publicInput,
      Signature.fromJSON(ofacData.signature)
    )

    const jsonProof = proof.toJSON()
    data.value.proof = JSON.stringify(jsonProof, null, 2)

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })
    emit('isLoading', false)
    emit('finished')
    emit('triggerNextStep')
  } catch (error) {
    console.error(error);
    msg.type = 'error'
    msg.content = "Something is wrong. You sure you are old enough? 👵🏼"
  } finally {
    data.value.isLoading = false
    emit('isLoading', false)
    await sleep(10000)
    message.destroyAll()
  }
}

onMounted(async () => {
})

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">  
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        Before starting, you'll check if your name is on the OFAC list.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="createProof()" :loading="data.isLoading">
        Create proof
      </n-button>
    </n-input-group>
  </n-space>

</template>

<style>

</style>
