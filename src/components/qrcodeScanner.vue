<script setup>
import { ref } from 'vue'
import * as CryptoJS from 'crypto-js'
import { QrcodeStream } from 'vue-qrcode-reader'
import { verify } from 'o1js'

import { useStore } from 'vuex'
import { useThemeVars } from 'naive-ui'
import { useMessage } from 'naive-ui'

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from './zkPrograms/ProofOfUniqueHuman.js'

import { compile } from './proofSteps/compile.js'
import { sleep } from './../utils.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
}

const dataShownAftervalidation = {
  proofOfAge: {
    header: ['Person is older than', 'Proof created at'],
    emojis: ['👵', '📅'],
    suffix: ['years', '']
  },
  proofOfSanctions: {
    header: ['OFAC reliability score', 'Proof created at'],
    emojis: ['🏛️', '📅'],
    suffix: ['%', '']
  },
  proofOfUniqueHuman: {
    header: ['Unique Identifier', 'Proof created at'],
    emojis: ['🧠', '📅'],
    suffix: ['', '']
  },
}

const store = useStore()
const themeVars = useThemeVars()
const message = useMessage()

const decodedValue = ref(null)
const proofData = ref(null)
const useCache = ref(false)
const isProofValid = ref(null)

const isLoading = ref(false)

const verifyProof = async (data) => {

  // fetch data from IPFS
  isProofValid.value = null
  let msg = message.create('Fetching a proof from IPFS 📡', { type: 'loading', duration: 10e9 })
  const ipfsUrl = 'https://ipfs.io/ipfs/'
  const response = await fetch(ipfsUrl + data.ipfs.IpfsHash)
  const response_ = await response.json()
  
  // decrypt data
  msg.content = "Decrypting data 🔐"
  var bytes  = CryptoJS.AES.decrypt(response_, data.secretKey)
  var proof = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

  // check if the proof is compiled and vk saved
  // if not compile and save verificationKey to store
  msg.content = "Compiling zk program 🛠️"


  /*
    Here, we should be using the compile fn just as everywhere else.
    But if useCache is set to true, verify fn fails.

    So useCache is set to false, it takes longer but no error ¯\_(ツ)_/¯
  */
  await compile(store, data.proof, proofs[data.proof], { useCache: useCache.value })

  // verify if the provided proof is correct
  msg.content = "Verifying the proof 🧐"
  try {
    let ok = await verify(proof, store.state.proofs.data[data.proof].verificationKey)
    if (ok) {
      msg.type = 'success'
      msg.content = "The proof is valid!"
      proofData.value = proof.publicOutput
      isProofValid.value = true
    } else {
      console.log('error')
      isProofValid.value = false
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
    await sleep(4000)
    msg.destroy()
  }
}

const onDetect = async (value) => {
  console.log('DETECTED')
  isLoading.value = true
  decodedValue.value = value.map((code) => JSON.parse(code.rawValue))
  await verifyProof(decodedValue.value[0])
};

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = themeVars.value.primaryColor
    ctx.lineWidth = 20

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()
  }
};

</script>

<template>
  <n-card>
    <n-space align="center" justify="center" vertical>
      <n-switch v-model:value="useCache">
        <template #checked>
          Use cache
        </template>
        <template #unchecked>
          No cache
        </template>
      </n-switch>
      <n-spin :show="isLoading">
        <qrcode-stream @detect="onDetect" :track="paintOutline" @errors="console.error" style="max-width: 30em;"/>
      </n-spin>
      <n-space align="center" vertical>
        <n-card v-if="decodedValue && proofData" size="large" :hoverable="true"> 
          <n-text type="success" tag="h4">
            <n-space vertical>
              <n-statistic :label="dataShownAftervalidation[decodedValue[0].proof].header[0]" :value="proofData[0]">
                <template #prefix>
                    {{ dataShownAftervalidation[decodedValue[0].proof].emojis[0] }}
                </template>
                <template #suffix>
                  {{ dataShownAftervalidation[decodedValue[0].proof].suffix[0] }}
                </template>
              </n-statistic>
              <br/>
              <n-statistic :label="dataShownAftervalidation[decodedValue[0].proof].header[1]" :value="proofData[1]">
                <template #prefix>
                  {{ dataShownAftervalidation[decodedValue[0].proof].emojis[1] }}
                </template>
                <template #suffix>
                  {{ dataShownAftervalidation[decodedValue[0].proof].suffix[1] }}
                </template>
              </n-statistic>
              <br/>
              <n-statistic label="Proof validity" :value="isProofValid.toString()">
                <template #prefix>
                 {{ isProofValid ? '✅' : '❌' }}
                </template>
              </n-statistic>
            </n-space>
          </n-text>
        </n-card>
      </n-space>
    </n-space>
  </n-card>
</template>

<style>

</style>
