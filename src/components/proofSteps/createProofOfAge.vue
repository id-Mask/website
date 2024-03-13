<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { sleep } from './../../utils.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

import { compile } from './compile.js'
import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import { PersonalData } from './../zkPrograms/ProofOfAge.utils.js'

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

const createProof = async () => {
  data.value.isLoading = true
  emit('isLoading', true)
  emit('finished', false)
  const pid = store.getters['pid/getData']

  // compile
  let msg = message.create('1/2 Compiling zkProgam 🧩🔨', { type: 'loading', duration: 10e9 })
  await compile(store, props.selectedProof, proofOfAge)

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

  msg.content = "2/2 Creating the proof 🌈✨"
  try {
    const personalData = new PersonalData({
      name: CircuitString.fromString(pid.data.name),
      surname: CircuitString.fromString(pid.data.surname),
      country: CircuitString.fromString(pid.data.country),
      pno: CircuitString.fromString(pid.data.pno),
      currentDate: Field(pid.data.currentDate),
    })
    const proof = await proofOfAge.proveAge(
      Field(data.value.ageToProveInYears),
      personalData,
      Signature.fromJSON(pid.signature)
    );

    const jsonProof = proof.toJSON()
    data.value.proof = JSON.stringify(jsonProof, null, 2)

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })
    emit('isLoading', false)
    emit('finished')

    msg.type = 'success'
    msg.content = "Congratulation! You've sucessfully created the proof 🎉"
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
        Input the number of years you wish to prove you are older than.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="createProof()" :loading="data.isLoading">
        Create proof
      </n-button>
      <n-input-number
        v-model:value="data.ageToProveInYears"
        placeholder="number of years"
        style="max-width: 14em;"
        min="1"
      />
    </n-input-group>

  </n-space>

</template>

<style>

</style>
