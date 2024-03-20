<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

import { compile } from './compile.js'
import { proofOfNationality } from './../zkPrograms/ProofOfNationality.js'
import { PersonalData } from './../zkPrograms/ProofOfAge.utils.js'

const message = useMessage()
const store = useStore()
const data = ref({
  proof: null,
  isLoading: false,
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished', 'isLoading', 'triggerNextStep'])

const createProof = async () => {
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)

  // TODO: create a signature, for a start go on with mock account
  let msg = message.create('1/3 Crafting your secrets 🤫🔐', { type: 'loading', duration: 10e9 })
  const pid = store.state.pid.data

  msg.content = "2/3 Compiling zkProgam 🧩🔨"
  await compile(store, props.selectedProof, proofOfNationality)

  /* pid e.g.:
  const pid = {
    "data": {
      "name": "Douglas",
      "surname": "Lyphe",
      "country": "EE",
      "pno": "PNOEE-67807022776",
      "currentDate": 20231026
    },
    "signature": {
      "r": "24098777140448874930684151839724232933324153889241260987160800793000424886288",
      "s": "26350209170644202625120216193969973021906199319302861651891544714558488811023"
    },
    "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
  }
  */

  msg.content = "3/3 Creating the proof 🌈✨"
  try {
    const personalData = new PersonalData({
      name: CircuitString.fromString(pid.data.name),
      surname: CircuitString.fromString(pid.data.surname),
      country: CircuitString.fromString(pid.data.country),
      pno: CircuitString.fromString(pid.data.pno),
      currentDate: Field(pid.data.currentDate),
    })
    const proof = await proofOfNationality.proveNationality(
      personalData,
      Signature.fromJSON(pid.signature),
      CircuitString.fromString(secretValue.data.secret),
      Signature.fromJSON(secretValue.signature)
    );

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
    msg.content = "Something is wrong. Sorry 🤔"
  } finally {
    data.value.isLoading = false
    emit('isLoading', false)
    await sleep(10000)
    message.destroyAll()
  }
}

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">  
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        You will generate a proof confirming your nationality and possession of an ID issued by your respective nation.
      </p>
    </n-text>
    <n-button type="primary" @click="createProof()" :loading="data.isLoading" disabled>
      Create proof
    </n-button>
  </n-space>

</template>

<style>

</style>
