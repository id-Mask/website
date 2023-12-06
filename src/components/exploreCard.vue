<script setup>
import { ref, h, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useBreakpoint } from 'vooks'

const store = useStore()
const breakpoint = useBreakpoint()

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
          href: `${url}account/${address}`,
          target: '_blank'
        }, publicKey_
      )
    }
  },
  {
    title: 'Data',
    key: 'event',
    render(row) {
      return row.event.length == 1 ? row.event : JSON.stringify(row.event) 
    }
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

const updateTable = async () => {
  isLoading.value = true
  const url = store.getters['settings/getGraphQlEnpoint']
  const zkAppKey = store.getters['proofs/getData'][props.selectedProof].address

  const data_ = await getProofs(url, zkAppKey)
  data.value = data_.data.events.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
  isLoading.value = false
}

onMounted( async () => {
  await updateTable()
})

// trigger when another proof is selected
watch(() => props.selectedProof,
  async () => { await updateTable() }
)

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
          Proofs saved to user's device stay completely private and invincible.
          However, it's possible to explore proofs that are put on-chain.
          Below are the proofs created and put on-chain.
        </p>
      </n-text>

      <n-data-table
        :bordered="true"
        :columns="columns"
        :data="data"
        :pagination="{ pageSize: 5 }"
        :loading="isLoading"
        :style="breakpoint == 'xs' ? 'font-size: 80%' : ''"
      />

    <template #action>
    </template>
  </n-card>
</template>

<style>

</style>
