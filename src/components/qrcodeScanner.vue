<script setup>
import { ref } from 'vue'
import * as CryptoJS from 'crypto-js'
import { QrcodeStream } from 'vue-qrcode-reader'
import { verify, PublicKey, Field } from 'o1js'

import { useStore } from 'vuex'
import { useThemeVars } from 'naive-ui'
import { useMessage } from 'naive-ui'

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from './zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from './zkPrograms/ProofOfNationality.js'

import { compile } from './proofSteps/compile.js'
import { sleep } from './../utils.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
  proofOfNationality: proofOfNationality,
}

const trimString = (string) => {
  if (string.length <= 10) {
    return string
  } else {
    const firstPart = string.substring(0, 5)
    const lastPart = string.substring(string.length - 5)
    return `${firstPart} ... ${lastPart}`
  }
}

const getProcessedPublicDataOfTheProof = (proofsPublicOutput, proofName) => {

  // convert public key encoded as an array of Fields to a string
  const getPublicKeyFromProofsOutput = (proofsPublicOutput) => {
    return PublicKey.fromFields([
      Field(proofsPublicOutput[2]),
      Field(proofsPublicOutput[3]),
    ]).toBase58()
  }

  // convert country encoded as an int into a string
  const getCountryFromUnicode = (countryUnicode) => {
    const firstTwoDigits = parseInt(countryUnicode.substring(0, 2))
    const nextTwoDigits = parseInt(countryUnicode.substring(2, 4))
    const char1 = String.fromCharCode(firstTwoDigits)
    const char2 = String.fromCharCode(nextTwoDigits)
    return char1 + char2
  }

  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)  
    return `${year}-${month}-${day}`
  }

  const proofs = {

    proofOfAge: {
      data: {
        data: proofsPublicOutput[0],
        header: 'Person is older than',
        emoji: '👵',
        suffix: null,
      },
      date: {
        data: formatDate(proofsPublicOutput[1]),
        header: 'Proof created at',
        emoji: '📅',
        suffix: null,
      },
      piublicKey: {
        data: getPublicKeyFromProofsOutput(proofsPublicOutput),
        header: 'Creators public key',
        emoji: '🔑',
        suffix: null,
      }
    },

    proofOfSanctions: {
      data: {
        data: proofsPublicOutput[0],
        header: 'OFAC reliability score',
        emoji: '📜',
        suffix: '%',
      },
      date: {
        data: formatDate(proofsPublicOutput[1]),
        header: 'Proof created at',
        emoji: '📅',
        suffix: null,
      },
      piublicKey: {
        data: getPublicKeyFromProofsOutput(proofsPublicOutput),
        header: 'Creators public key',
        emoji: '🔑',
        suffix: null,
      }
    },

    proofOfUniqueHuman: {
      data: {
        data: proofsPublicOutput[0],
        header: 'Unique Identifier',
        emoji: '🧠',
        suffix: null,
      },
      date: {
        data: formatDate(proofsPublicOutput[1]),
        header: 'Proof created at',
        emoji: '📅',
        suffix: null,
      },
      piublicKey: {
        data: getPublicKeyFromProofsOutput(proofsPublicOutput),
        header: 'Creators public key',
        emoji: '🔑',
        suffix: null,
      }
    },

    proofOfNationality: {
      data: {
        data: getCountryFromUnicode(proofsPublicOutput[0]),
        header: 'Nationality',
        emoji: '🏛️',
        suffix: null,
      },
      date: {
        data: formatDate(proofsPublicOutput[1]),
        header: 'Proof created at',
        emoji: '📅',
        suffix: null,
      },
      piublicKey: {
        data: getPublicKeyFromProofsOutput(proofsPublicOutput),
        header: 'Creators public key',
        emoji: '🔑',
        suffix: null,
      }
    },

  }
  return proofs[proofName]
}


const store = useStore()
const themeVars = useThemeVars()
const message = useMessage()

const decodedValue = ref(null)
const proofData = ref(null)
const useCache = ref(false)
const isProofValid = ref(false)
const isLoading = ref(false)

const verifyProof = async (data) => {

  // fetch data from IPFS
  isLoading.value = true
  isProofValid.value = false
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
      msg.content = 'The proof is valid!'
      proofData.value = getProcessedPublicDataOfTheProof(proof.publicOutput, data.proof)
      isProofValid.value = true
    } else {
      console.log('error')
      isProofValid.value = false
      msg.type = 'error'
      msg.content = 'The proof is not valid!'
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
        <n-card v-if="decodedValue && proofData" size="large" style="scale: 0.8" :hoverable="true"> 
          <n-spin :show="isLoading">
            <n-space :size="[2, 2]" vertical v-for="(value, _) in proofData">
              <n-statistic :label="value.header">
                <template #default>
                  <span v-if="!isLoading">
                    {{ trimString(value.data) }}
                  </span>
                </template>
                <template #prefix>
                  {{ value.emoji }}
                </template>
                <template #suffix>
                  {{ value.suffix }}
                </template>
              </n-statistic>
              <br/>
            </n-space>
            <n-statistic label="Proof validity" :value="isProofValid.toString()">
              <template #prefix v-if="!isLoading">
              {{ isProofValid ? '✅' : '❌' }}
              </template>
            </n-statistic>
          </n-spin>
        </n-card>
      </n-space>
    </n-space>
  </n-card>
</template>

<style>

</style>
