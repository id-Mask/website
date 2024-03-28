<script setup>
import { ref } from 'vue'
import { PublicKey, Field } from 'o1js'

const props = defineProps({
  proofPublicOutput: Object,
  isProofValid: Boolean,
  isLoading: Boolean,
  proofName: String,
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

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <n-space :size="[2, 2]" vertical v-for="(value, _) in getProcessedPublicDataOfTheProof(props.proofPublicOutput, props.proofName)">
    <n-statistic :label="value.header">
      <template #default>
        <span v-if="!isLoading">
          <n-popover trigger="click">
            <template #trigger>
              <span @click="copyToClipboard(value.data)" style="cursor: pointer;">
                {{ trimString(value.data) }}
              </span>
            </template>
            <span>Copied</span>
          </n-popover>
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
  <n-statistic label="Proof validity" :value="props.isProofValid.toString()">
    <template #prefix v-if="!props.isLoading">
      {{ isProofValid ? '✅' : '❌' }}
    </template>
  </n-statistic>
</template>

<style>

</style>
