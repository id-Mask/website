<script setup>
import { ref, h, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { NButton } from 'naive-ui'
import { useIsMobile } from '../utils.js'
import proofsPublicOutputDataCard from './componentUtils/proofsPublicOutputDataCard.vue'

import { Mina, fetchEvents } from 'o1js'

const isMobile = useIsMobile()
const store = useStore()

const props = defineProps({
  selectedProof: String,
})

const columns = ref([
  {
    title: 'Block',
    render(row) {
      let url = store.state.settings.networks[store.state.settings.selectedNetwork].blockExplorer
      return h(
        'a', {
          href: `${url}block/${row.blockHash}`,
          target: '_blank'
        }, row.blockHeight
      )
    }
  },
  {
    title: 'Transaction',
    render(row) {
      let txHash = row.events[0].transactionInfo.hash
      let txHash_ = txHash.slice(0, 5) + ' ... ' + txHash.slice(-5)
      let url = store.state.settings.networks[store.state.settings.selectedNetwork].blockExplorer
      return h(
        'a', {
          href: `${url}tx/${txHash}`,
          target: '_blank'
        }, txHash_
      )
    }
  },
  {
    title: 'Status',
    key: 'events[0].transactionInfo.status'
  },
  {
    title: 'Chain',
    key: 'chainStatus'
  },
  {
    title: 'Proof data',
    key: 'events',
    render (row) {
      return h(
        NButton,
        {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: () => showData(row.events[0].data)
        },
        { default: () => 'show' }
      )
    }
  },
])

const isLoading = ref(false)
const data = ref([])

const updateTable = async () => {
  isLoading.value = true

  // setup mina network for archive fetching
  const Network = Mina.Network({
    networkId: store.state.settings.networks[store.state.settings.selectedNetwork].networkId,
    mina: store.state.settings.networks[store.state.settings.selectedNetwork].nodeUrl,
    archive: store.state.settings.networks[store.state.settings.selectedNetwork].graphQLURL,
  })
  Mina.setActiveInstance(Network)

  // fetch
  const zkAppKey = store.getters['proofs/getData'][props.selectedProof].address
  const events = await fetchEvents({ publicKey: zkAppKey })
  const events_ = JSON.parse(JSON.stringify(events)) // to get rid of weird objects inside ?!
  data.value = events_.sort((a, b) => b.blockHeight - a.blockHeight)
  isLoading.value = false
}

const showModal = ref(false)
const modalData = ref(null)

const showData = (event) => {
  showModal.value = true
  modalData.value = event
}

onMounted( async () => {
  await updateTable()
})

// trigger when another proof or network is selected
watch(() => [props.selectedProof, store.state.settings.selectedNetwork],
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
      <n-space :justify="isMobile ? 'center' : 'space-between'">
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
        style="font-size: 90%;"
      />

    <template #action>
    </template>
  </n-card>

  <n-modal v-model:show="showModal">
    <n-card
      style="scale: 0.8; max-width: 340px"
      size="huge"
    >
      <proofsPublicOutputDataCard 
        :proofName="props.selectedProof" 
        :proofPublicOutput="modalData" 
        :isProofValid="true" 
        :isLoading="false" 
        :showVerifyButton="false"
      />
    </n-card>
  </n-modal>

</template>

<style>

</style>
