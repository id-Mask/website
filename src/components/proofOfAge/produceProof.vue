<script setup>
import { ref, onMounted } from 'vue'
import { sleep } from './../../utils.js'
import { proofOfAge } from './../zkPrograms/ProofOfAge.js'
import {
  CircuitString,
  Field,
  Signature
} from 'o1js'

const data = ref({
  proof: null,
  isLoading: false,
  ageToProveInYears: null,
})

const emit = defineEmits(['finished'])

const createProof = async () => {
    data.value.isLoading = true
    const mock_data = {
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

    const proof = await proofOfAge.proveAge(
      Field(data.value.ageToProveInYears),
      CircuitString.fromString(mock_data.data.name),
      CircuitString.fromString(mock_data.data.surname),
      CircuitString.fromString(mock_data.data.country),
      CircuitString.fromString(mock_data.data.pno),
      Field(mock_data.data.timestamp),
      Signature.fromJSON(mock_data.signature)
    );
    data.value.proof = JSON.stringify(proof.toJSON()).slice(0, 300) + ' ...'
    data.value.isLoading = false
    emit('finished')
}

onMounted(async () => {
})

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Produce the proof
    </n-text>

    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        The proof generation will again take some time. Once it is finished, you'll be able to pick options what you want to do with it.
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
          Proof: <br><br>
          {{ data.proof }}
        </template>
      </n-card>
    </n-spin>

  </n-space>

</template>

<style>

</style>
