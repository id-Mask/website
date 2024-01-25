<script setup>
import { ref } from 'vue'
import * as CryptoJS from 'crypto-js'
import { QrcodeStream } from 'vue-qrcode-reader'
import { verify } from 'o1js';

import { useStore } from 'vuex'

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from './zkPrograms/ProofOfUniqueHuman.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
}

const store = useStore()

const decodedValue = ref(null)
const proofData = ref(null)
const isOpen = ref(false)

const isLoading = ref(false)
const progressText = ref('')

const verifyProof = async (data) => {

  // fetch data from IPFS
  const ipfsUrl = 'https://ipfs.io/ipfs/'
  const response = await fetch(ipfsUrl + data.ipfs.IpfsHash)
  const response_ = await response.json()
  progressText.value = 'fetched data from IPFS'
  
  // decrypt data
  var bytes  = CryptoJS.AES.decrypt(response_, data.secretKey)
  var proof = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  progressText.value = 'decripted'

  // check if the proof is compiled and vk saved
  // if not compile and save verificationKey to store
  if (!store.state.proofs.data[data.proof].verificationKey) {
    progressText.value = 'compiling'
    const { verificationKey } = await proofs[data.proof].compile()
    store.state.proofs.data[data.proof].verificationKey = verificationKey
  }

  // verify if the provided proof is correct
  try {
    progressText.value = 'verifying'
    let ok = await verify(proof, store.state.proofs.data[data.proof].verificationKey)
    if (ok) {
      progressText.value = 'verified!'
      proofData.value = proof.publicOutput
    } else {
      progressText.value = 'Somethings wrong'
    }
  } catch (error) {
    progressText.value = 'Somethings wrong 2'
  } finally {
    isLoading.value = false
    decodedValue.value = null
  }
}

const onDetect = async (value) => {
  console.log('DETECTED')
  isLoading.value = true
  progressText.value = 'detected'
  decodedValue.value = value.map((code) => JSON.parse(code.rawValue))
  await verifyProof(decodedValue.value[0])
};

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = 'red'

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
  <n-button type="primary" @click="isOpen = !isOpen">scan QR code
  </n-button>
  <div v-if="isOpen">
    <n-modal style="width: 90%" :mask-closable="true" v-model:show="isOpen">
      <n-card>
        <qrcode-stream @detect="onDetect" :track="paintOutline" @errors="console.error" />
        <template #footer>
          <n-space align="center" vertical>
            <div v-if="decodedValue">
              {{ decodedValue }}
            </div>
            <n-text type="success" tag="h2" v-else>
              Scan QR code 🧐
            </n-text>
            <n-text type="success" tag="h3">
              <n-spin size="small" v-if="isLoading" />
              {{ progressText }}
            </n-text>
            <div>
              {{ proofData }}
            </div>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style>

</style>
