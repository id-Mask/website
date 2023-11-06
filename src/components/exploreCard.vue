<script setup>
import { ref, h, onMounted } from 'vue'
import { useThemeVars, NTag } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { verify } from 'o1js';
import { proofOfAge } from './zkPrograms/ProofOfAge.js'

const themeVars = useThemeVars()
const store = useStore()
const message = useMessage()

const props = defineProps({
  selectedProof: String,
})

const columns = ref([
  {
    title: 'Date',
    key: 'dateTime'
  },
  {
    title: 'Block',
    key: 'blockHeight'
  },
  {
    title: 'Transaction',
    key: 'zkAppCommandHash.hash',
    render(row) {
      let txHash = row.zkAppCommandHash.hash
      let txHash_ = txHash.slice(0, 5) + ' ... ' + txHash.slice(-5)
      let url = store.getters['settings/getBlockExplorerEnpoint']
      return h(
        'a', {
          href: `${url}tx/${txHash}`,
          target: '_blank'
        }, txHash_
      )
    }
  },
  {
    title: 'Address',
    key: 'zkAppCommandHash.zkappCommand.feePayer.body.publicKey',
    render(row) {
      let address = row.zkAppCommandHash.zkappCommand.feePayer.body.publicKey
      let publicKey_ = address.slice(0, 5) + ' ... ' + address.slice(-5)
      let url = store.getters['settings/getBlockExplorerEnpoint']
      return h(
        'a', {
          href: `${url}/account/${address}`,
          target: '_blank'
        }, publicKey_
      )
    }
  },
  {
    title: 'Data',
    key: 'event'
  },
])

const isLoading = ref(false)
const data = ref([])

const getProofs = async (url, zkAppKey) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query MyQuery {
          events(query: {
            zkAppCommandHash: {
              zkappCommand: {
                accountUpdates: {
                  body: {publicKey: "${zkAppKey}"}
                },
                feePayer: {}
              }
            },
            canonical: true
          }) {
            blockHeight
            canonical
            dateTime
            event
            zkAppCommandHash {
              zkappCommand {
                feePayer {
                  body {
                    publicKey
                  }
                }
              }
              hash
            }
          }
        }
      `,
    }),
  });
  const response_ = await response.json()
  return response_
};

onMounted( async () => {
  isLoading.value = true
  const url = store.getters['settings/getGraphQlEnpoint']
  const zkAppKey = store.getters['proofs/getData'][props.selectedProof].address

  const data_ = await getProofs(url, zkAppKey)
  data.value = data_.data.events
  isLoading.value = false
})

// map proof key to it's display name
const mapping = ref({})
const proofData = store.getters['proofs/getData']
Object.keys(proofData).forEach(key => {
  mapping.value[key] = proofData[key].displayName;
});

</script>

<template>
  <br>
  <n-card
    :segmented="{ content: true, footer: 'soft' }"
    :header-extra-style="{'align-items': 'start'}"
  >
    <template #header>
      <n-space vertical :size="20">
        <div>Explore {{ mapping[props.selectedProof] }}</div>
      </n-space>
    </template>
      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          It's only possible to explore proofs that are put on-chain. Proofs saved to user's device stay private.
          Below are all of the {{ mapping[props.selectedProof] }} proofs created and put on-chain.
        </p>
      </n-text>

      <n-data-table
        :bordered="true"
        :columns="columns"
        :data="data"
        :pagination="{ pageSize: 5 }"
        :loading="isLoading"
      />

    <template #action>
    </template>
  </n-card>
</template>

<style>

</style>
