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

import { sleep } from './../utils.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
}

const store = useStore()
const themeVars = useThemeVars()
const message = useMessage()

const decodedValue = ref(null)
const proofData = ref(null)
const isOpen = ref(false)

const isLoading = ref(false)
const progressBarWidth = ref(0)

const verifyProof = async (data) => {

  // fetch data from IPFS
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
  if (!store.state.proofs.data[data.proof].verificationKey) {
    const { verificationKey } = await proofs[data.proof].compile()
    store.state.proofs.data[data.proof].verificationKey = verificationKey
  }

  // verify if the provided proof is correct
  msg.content = "Verifying the proof 🧐"
  try {
    let ok = await verify(proof, store.state.proofs.data[data.proof].verificationKey)
    if (ok) {
      msg.type = 'success'
      msg.content = "The proof is valid!"
      proofData.value = proof.publicOutput
    } else {
      console.log('error')
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
  <n-button type="primary" @click="isOpen = !isOpen">scan QR code</n-button>
  <div v-if="isOpen">
    <n-modal style="width: 90%" :mask-closable="true" v-model:show="isOpen">
      <n-card>
        <n-spin :show="isLoading">
          <qrcode-stream @detect="onDetect" :track="paintOutline" @errors="console.error" />
        </n-spin>
        <template #footer>
          <n-space align="center" vertical>
            <n-card v-if="decodedValue && proofData" size="large" :hoverable="true"> 
              <n-text type="success" tag="h4">

                <div v-if="decodedValue[0].proof == 'proofOfAge'">
                  Older than: {{ proofData[0] }}
                  <br/>
                  Created at: {{ proofData[1] }}
                </div>

                <div v-if="decodedValue[0].proof == 'proofOfUniqueHuman'">
                  Unique Identifier: {{ proofData[0] }}
                  <br/>
                  Created at: {{ proofData[1] }}
                </div>

                <div v-if="decodedValue[0].proof == 'proofOfNonSanctions'">
                  OFAC reliability score: {{ proofData[0] }}
                  <br/>
                  Created at: {{ proofData[1] }}
                </div>

              </n-text>
            </n-card>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style>

</style>
