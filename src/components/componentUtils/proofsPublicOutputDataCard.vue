<script setup>
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { PublicKey, Field } from 'o1js'
import { useStore } from 'vuex'
import ProofOwnershipInitiator from './proofOwnershipInitiator.vue'
import PasskeysChallangeInitiator from './passkeysChallangeInitiator.vue'

import { 
  Secp256r1,
  toPublicKeyHex,
  decodeFromAsciiNumber,
} from './../zkPrograms/proof.utils.js'

const message = useMessage()
const store = useStore()

const props = defineProps({
  proofPublicOutput: Object,
  isProofValid: Boolean,
  isLoading: Boolean,
  proofName: String,
  showVerifyButton: { type: Boolean, default: true }
})

const processedProofData = ref({})
const processedProofDataFull = ref({})
const publicKeysMatch = ref(null)
const proofOwnershipVerification = ref({
  showQRCodeModal: false,
})

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
  const getMinaPublicKeyFromProofsOutput = (proofsPublicOutput) => {
    return PublicKey.fromFields([
      Field(proofsPublicOutput[2]),
      Field(proofsPublicOutput[3]),
    ]).toBase58()
  }

  // convert passkey id encoded as an array of Fields to a string
  const getPasskeysPublicKeyFromProofsOutput = (proofsPublicOutput) => {
    const x = proofsPublicOutput.slice(4, 7).map(i => new Field(i));
    const y = proofsPublicOutput.slice(7, 10).map(i => new Field(i));
    const pk = new Secp256r1({x: x, y: y}).toBigint()
    return toPublicKeyHex(pk.x, pk.y)
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

  try {
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
        publicKey: {
          data: getMinaPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Mina public key',
          emoji: '🔑',
          suffix: null,
        },
        passkey: {
          data: getPasskeysPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Passkey public key',
          emoji: '🔑',
          suffix: null
        },
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
        publicKey: {
          data: getMinaPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Mina public key',
          emoji: '🔑',
          suffix: null,
        },
        passkey: {
          data: getPasskeysPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Passkey public key',
          emoji: '🔑',
          suffix: null
        },
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
        publicKey: {
          data: getMinaPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Mina public key',
          emoji: '🔑',
          suffix: null,
        },
        passkey: {
          data: getPasskeysPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Passkey public key',
          emoji: '🔑',
          suffix: null
        },
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
        publicKey: {
          data: getMinaPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Mina public key',
          emoji: '🔑',
          suffix: null,
        },
        passkey: {
          data: getPasskeysPublicKeyFromProofsOutput(proofsPublicOutput),
          header: 'Passkey public key',
          emoji: '🔑',
          suffix: null
        },
      },
    }


    return proofs[proofName]

  /*
    what if failed to parse the proofs public output or some other part?
    for example if an old proof with different structure is provided
    the above fns will fail.
  */
  } catch (error) {
    console.log(error)
    return {}
  }
}

const removeItemsWithDefaultValues = (proofData) => {

    // To do that will have to refactor the html par as well

    /*
      check if the proof is signed using the default Mina key pair and remove it
      from the object if that is the case. If not, keep it and it will show on the UI.
    */
    const defaultMinaPublicKey = store.state.settings.userSignatureOptions.defaultKeyPair.publicKey
    const isSignedWithDefaultMinaKeys = proofData.publicKey.data == defaultMinaPublicKey
    if (isSignedWithDefaultMinaKeys) {
      delete proofData.publicKey
    }

    /*
      check if the proof is signed using the default passkeys pair and remove it
      from the object if that is the case. If not, keep it and it will show on the UI.
    */
    const defaultPasskeyPublicKey = store.state.settings.passkeysOptions.defaultSignatureValues.publicKeyHex
    const isSignedWithDefaultPassKeys = proofData.passkey.data == defaultPasskeyPublicKey
    if (isSignedWithDefaultPassKeys) {
      delete proofData.passkey
    }

    return proofData
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  message.success('Copied!')
}

const initProofOwnershipVerification = () => {
  proofOwnershipVerification.value.showQRCodeModal = true
}

onMounted(() => {
  console.log(props.proofPublicOutput)
  processedProofDataFull.value = getProcessedPublicDataOfTheProof(props.proofPublicOutput, props.proofName)
  processedProofData.value = removeItemsWithDefaultValues(processedProofDataFull.value)
})

</script>

<template>
  <n-spin :show="props.isLoading">
    <div v-if="!props.isLoading">
      <div v-if="props.proofPublicOutput[11] == '1'">
        <n-result
          status="warning"
          title="Warning"
          size="small"
        >
        <template #default>
          <n-text depth="3">
            This proof was generated using simulated data, not real data.
          </n-text>
        </template>
        </n-result>
        <br/>
         <n-divider />
        <br/>
      </div>
      <n-space 
        :size="[2, 2]" 
        vertical 
        v-for="([key, value], _) in Object.entries(processedProofData).filter(([key]) => key !== 'publicKey' && key !== 'passkey')"
        :key="key"
      >
        <n-statistic>
          <template #label>
            {{ value.header }}
            <span v-if="value.data.startsWith('B62')">
              <n-button 
                v-if="publicKeysMatch == null && props.showVerifyButton" 
                quaternary 
                @click="initProofOwnershipVerification()"
              >🎒</n-button>
              <n-badge type="success" v-if="publicKeysMatch">
                <n-button quaternary @click="initProofOwnershipVerification()">🎒</n-button>
                <template #value>
                  <n-icon>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </n-icon>
                </template>
              </n-badge>
            </span>
          </template>
          <template #default>
            <n-text @click="copyToClipboard(value.data)" style="cursor: pointer;">
              {{ trimString(value.data) }}
            </n-text>
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
      <n-statistic label="Proof validity" :value="props.isProofValid.toString()">
        <template #prefix v-if="!props.isLoading">
          {{ isProofValid ? '✅' : '❌' }}
        </template>
      </n-statistic>
    </div>
  </n-spin>

  <div 
    v-if="processedProofData 
      && processedProofData.passkey 
      && processedProofData.passkey.data 
      && processedProofData.passkey.data !== store.state.settings.passkeysOptions.defaultSignatureValues.publicKeyHex">
    <PasskeysChallangeInitiator
      :publicKeyHex="processedProofData.passkey.data" 
      :passkeysID="decodeFromAsciiNumber(BigInt(props.proofPublicOutput[10]))"
    />
  </div>

  <n-modal v-model:show="proofOwnershipVerification.showQRCodeModal">
    <n-card style="max-width: 30em;">
      <n-flex justify="center">
        <ProofOwnershipInitiator :publicKey="processedProofData.publicKey.data" @publicKeysMatch="() => {publicKeysMatch = true}"/>
      </n-flex>
    </n-card>
  </n-modal>

</template>

<style>

</style>
