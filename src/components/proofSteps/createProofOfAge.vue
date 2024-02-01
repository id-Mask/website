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

import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

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

  <n-space vertical>
    <n-text type="default">
      Create the proof
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        The proof generation will again some time. Once it is finished, you'll be able to pick options what you want to do with it.
      </p>
      <p>
        Note that the generated proof does not include any of your private data. It includes public inputs which in this case is the number of years you're proving you are older than,
        public outputs, which is always 1 and shows that your age is more than the number of years, and the proof itself which is cryptographic jumble of letters and numbers.
      </p>
      <p>
        Below, input the number of years you wish to prove you're older than.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="createProof()" :loading="data.isLoading">
        Create proof
      </n-button>
      <n-input-number
        v-model:value="data.ageToProveInYears"
        placeholder="the number of years"
        style="width: 100%;"
        min="1"
      />
    </n-input-group>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="data.proof || data.isLoading">
        <template #action>
          Created proof:
          <br><br>
          <n-scrollbar x-scrollable>
            <n-code
              :code="data.proof ? data.proof : '{}'"
              :hljs="hljs"
              language="json"
              class="code"
              style="white-space: nowrap;"
            />
          </n-scrollbar>
        </template>
      </n-card>
    </n-spin>

  </n-space>

</template>

<style>

.code {
  font-family: "JetBrains Mono";
  font-size: 90%;
}

.hljs-punctuation {
  color: v-bind(themeVars.textColor1) !important;
}

.hljs-attr {
  color: v-bind(themeVars.textColor3) !important;
}

.hljs-number {
  color: v-bind(themeVars.primaryColor) !important;
}

.hljs-string {
  color: v-bind(themeVars.primaryColor) !important;
}

</style>
