<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { verify } from 'o1js';
import qrcodeScanner from './qrcodeScanner.vue';

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman } from './zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality } from './zkPrograms/ProofOfNationality.js'

import { Mina, fetchEvents } from 'o1js'

import proofsPublicOutputDataCard from './componentUtils/proofsPublicOutputDataCard.vue'

import { compile } from './proofSteps/compile.js'
import { useIsMobile } from '../utils.js'
import { sleep } from './../utils.js'

const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions,
  proofOfUniqueHuman: proofOfUniqueHuman,
  proofOfNationality: proofOfNationality,
}

const isMobile = useIsMobile()
const store = useStore()
const message = useMessage()

const props = defineProps({
  selectedProof: String,
})

const fileList = ref([])
const address = ref('')
const isLoading = ref(false)
const showModal = ref(false)
const modalData = ref({})


const verifyJSONProof = async (proof) => {

  let msg = message.loading('Compiling zk program 🛠️', { closable: true, duration: 10e9 })

  // compile
  await compile(store, props.selectedProof, { useCache: false })

  // verify if the provided proof is correct
  msg.content = 'Verifying the proof 🧐'
  try {
    let ok = await verify(proof, store.state.proofs.data[props.selectedProof].verificationKey);
    if (ok) {
      msg.type = 'success'
      msg.content = 'The proof is valid!'
      modalData.value = proof.publicOutput
      showModal.value = true
    } else {
      msg.type = 'error'
      msg.content = 'Failed to verify the proof'
    }
  } catch (error) {
    msg.type = 'error'
    msg.content = 'Something is wrong.'
  } finally {
    isLoading.value = false
    await sleep(4000)
    msg.destroy()
  }
}

const handleUpload = async ({file, event}) => {
  var reader = new FileReader()
  reader.onload = async (event) => {
    try {
      var json = JSON.parse(reader.result)
    } catch (error) {
      console.error(error)
    }
    await verifyJSONProof(json)
  }
  reader.readAsText(file.file)
}

const verifyOnChainProof = async () => {

  const getZkAppTxs = async (zkAppAddress) => {
    /*
      This is overly complicated because we can only fetch last 50 txs. 
      What if there is more!? We need a while loop that continuesly fetches
      and concatinates unitl we arrive at the last page of txs and got an
      array full of all txs.

      Also bad because we've to expose the api key. This should be public free API ideally.
    */
    const apiKey = 'U2xR6593JPsXQGRoZr0Nh8zlCUC6m8'
    let page = 0
    let response_
    let transactions = []
    do {
      const url = `https://api.blockberry.one/mina-mainnet/v1/zkapps/accounts/${zkAppAddress}/txs?page=${page}&size=50&orderBy=DESC&sortBy=AGE`;
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey
        }
      })
      response_ = await response.json()
      transactions = transactions.concat(response_.data)
      page += 1
    } while (!response_.last)
    return transactions
  };

  // prep
  isLoading.value = true
  let msg = message.loading('verifying', { closable: true, duration: 10000 })

  /*
    There's def a better way to do it...?
    Ideally: fetch all user txs, check if it has a tx with the zkApp.
    Fetch that transaction events.

    Now:
    Fetch all zkApp transcations
    Find transaction which prover is the address
    Fetch all zkApp events 
    Map the user tx hash with the events tx hash
    Display in the UI
  */
  try {
      // fetch all zkApp transactions and find the last transaction with a proof
      // TODO: THIS ONLY WORKS FOR MAINNET 
      const data = await getZkAppTxs(store.state.proofs.data[props.selectedProof].address)
      const proofTx = data.find(item => item.proverAddress === address.value)

      // fetch all zkApp events
      // setup mina network for archive fetching (could do inside watch, but lets repeat this every time)
      const Network = Mina.Network({
        networkId: store.state.settings.networks[store.state.settings.selectedNetwork].networkId,
        mina: store.state.settings.networks[store.state.settings.selectedNetwork].nodeUrl,
        archive: store.state.settings.networks[store.state.settings.selectedNetwork].graphQLURL,
      })
      Mina.setActiveInstance(Network)

      const accountInfo = { publicKey: store.state.proofs.data[props.selectedProof].address };
      const events = await fetchEvents(accountInfo);

      // match proofTx with corresponding event
      const event = events.find(event => event.events[0].transactionInfo.hash == proofTx.hash)
      console.log(event)

      msg.type = 'success'
      msg.content = 'The proof is valid!'
      modalData.value = event.events[0].data
      showModal.value = true

  } catch (error) {
    msg.type = 'error'
    msg.content = 'The address has no proof!'
  } finally {
    isLoading.value = false
    await sleep(4000)
    msg.destroy()
  }
}

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
        <div>Verify {{ mapping[props.selectedProof] }}</div>
      </n-space>
    </template>

    <n-space vertical :size="28" align="center" justify="center" style="min-height: 20em;">

      <n-text type="default">
        Pick a method
      </n-text>

      <n-tabs type="segment" animated size="medium" :style="!isMobile ? 'min-width: 35em;' : ''">
        <n-tab-pane tab="JSON" name="JSON">
          <n-upload @change="handleUpload" v-model:file-list="fileList" :show-file-list="false">
            <n-upload-dragger>
              <div>
                <n-icon size="28" :depth="3">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M64 164v244a56 56 0 0 0 56 56h272a56 56 0 0 0 56-56V164a4 4 0 0 0-4-4H68a4 4 0 0 0-4 4zm267 151.63l-63.69 63.68a16 16 0 0 1-22.62 0L181 315.63c-6.09-6.09-6.65-16-.85-22.38a16 16 0 0 1 23.16-.56L240 329.37V224.45c0-8.61 6.62-16 15.23-16.43A16 16 0 0 1 272 224v105.37l36.69-36.68a16 16 0 0 1 23.16.56c5.8 6.37 5.24 16.29-.85 22.38z" fill="currentColor"></path><rect x="32" y="48" width="448" height="80" rx="32" ry="32" fill="currentColor"></rect></svg>
                </n-icon>
              </div>
              <n-text>
                Click or drag a file to this area
              </n-text>
              <n-p depth="3" style="font-size: 95%;">
                User submitted proof in the form of JSON
              </n-p>
            </n-upload-dragger>
          </n-upload>
        </n-tab-pane>
        <n-tab-pane tab="QR code" name="QR code">
          <qrcodeScanner />
        </n-tab-pane>
        <n-tab-pane tab="Mina address" name="Mina address">
          <n-input-group>
            <n-button 
              type="primary" 
              @click="verifyOnChainProof" 
              :loading="isLoading" 
              :disabled="store.state.settings.networks[store.state.settings.selectedNetwork].networkId != 'mainnet'"
            >
              Verify
            </n-button>
            <n-input :style="{ width: '100%' }" v-model:value="address" placeholder="Mina address" />
          </n-input-group>
        </n-tab-pane>
      </n-tabs>
    </n-space>
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
      />
    </n-card>
  </n-modal>

</template>

<style>

</style>
