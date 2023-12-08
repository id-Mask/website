<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import {
  CircuitString,
  Field,
  Bool,
  Signature
} from 'o1js'

import { proofOfSanctions, PublicInput } from './../zkPrograms/ProofOfSanctions.js'

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

const emit = defineEmits(['finished', 'isLoading'])

const createProof = async () => {
    data.value.isLoading = true
    emit('isLoading', true)
    emit('finished', false)
    const ofacData = store.state.sanctions.data

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

      // save proof to store (to be able to access it form other components)
      store.dispatch('proofs/saveData', { proofName: props.selectedProof, proof: jsonProof })
      emit('isLoading', false)
      emit('finished')
    } catch (error) {
      console.error(error);
      message.error(
        'Something is wrong. Are you sure you are not sanctioned? 🏛️',
        { closable: true, duration: 10000 }
      )
    }
    data.value.isLoading = false
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

    <n-input-group>
      <n-button type="primary" @click="createProof()">
        Create proof
      </n-button>
    </n-input-group>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="data.proof || data.isLoading">
        <template #action>
          Created proof:
          <br><br>
          <n-scrollbar style="max-height: 300px" x-scrollable>
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
