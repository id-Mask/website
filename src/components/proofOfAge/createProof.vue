<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import { sleep } from './../../utils.js'
import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

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


const emit = defineEmits(['finished'])

const createProof = async () => {
    data.value.isLoading = true
    const pid = store.getters['pid/getData']

    /* pid e.g.:
    const pid = {
      "data": {
        "name": "Douglas",
        "surname": "Ouse",
        "country": "EE",
        "pno": "PNOLT-40411112845",
        "timestamp": 1696597311
      },
      "signature": {
        "r": "4005815270229227556085198150684933726274609081525843350186808600943204775509",
        "s": "22010117647676154345205272589800128568196540356023825778384435699657257987616"
      },
      "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
    }
    */

    const proof = await proofOfAge.proveAge(
      Field(data.value.ageToProveInYears),
      CircuitString.fromString(pid.data.name),
      CircuitString.fromString(pid.data.surname),
      CircuitString.fromString(pid.data.country),
      CircuitString.fromString(pid.data.pno),
      Field(pid.data.timestamp),
      Signature.fromJSON(pid.signature)
    );

    const jsonProof = proof.toJSON()
    data.value.proof = JSON.stringify(jsonProof, null, 2)

    // save proof to store (to be able to access it form other components)
    store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })

    data.value.isLoading = false
    emit('finished')
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
        The proof generation will again take some time. Once it is finished, you'll be able to pick options what you want to do with it.
      </p>
      <p>
        Note that the generated proof does not include any of your private data. It includes public inputs which in this case is the number of years you're proving you are older than,
        public outputs, which is always 1 and shows that your age is more than the number of years, and the proof itself which is cryptographic jumble of letters and numbers.
      </p>
      <p>
        Below, input the number of years you wish to prove you're older than.
      </p>
    </n-text>

    <n-input-number
      v-model:value="data.ageToProveInYears"
      placeholder="the number of years"
      min="1"
    />
    <n-button type="primary" @click="createProof()">
      Create proof
    </n-button>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="data.proof || data.isLoading">
        <template #action>
          Created proof:
          <br><br>
          <n-scrollbar x-scrollable>
            <n-code :code="data.proof ? data.proof : '{}'" :hljs="hljs" language="json" class="code" style="white-space: nowrap;"/>
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
