<script setup>
import { ref, onMounted, h } from 'vue'
import { useThemeVars, useMessage, useNotification } from 'naive-ui'
import { useStore } from 'vuex'
import { sleep } from './../../utils.js'
import { Mina, PublicKey, fetchAccount } from 'o1js'

import { proofOfAge, ProofOfAge, ProofOfAgeProof } from './../zkPrograms/ProofOfAge.js'
import { proofOfSanctions, ProofOfSanctions, ProofOfSanctionsProof } from './../zkPrograms/ProofOfSanctions.js'
import { proofOfUniqueHuman, ProofOfUniqueHuman, ProofOfUniqueHumanProof } from './../zkPrograms/ProofOfUniqueHuman.js'
import { proofOfNationality, ProofOfNationality, ProofOfNationalityProof } from './../zkPrograms/ProofOfNationality.js'

import saveProofToGoogleWallet from './saveProofToGoogleWallet.vue'
import saveProofToAppleWallet from './saveProofToAppleWallet.vue'


const proofs = {
  proofOfAge: {
    SmartContract: ProofOfAge,
    ProofOfZkProgram: ProofOfAgeProof
  },
  proofOfSanctions: {
    SmartContract: ProofOfSanctions,
    ProofOfZkProgram: ProofOfSanctionsProof
  },
  proofOfUniqueHuman: {
    SmartContract: ProofOfUniqueHuman,
    ProofOfZkProgram: ProofOfUniqueHumanProof
  },
  proofOfNationality: {
    SmartContract: ProofOfNationality,
    ProofOfZkProgram: ProofOfNationalityProof
  },
}

const notification = useNotification()
const message = useMessage()
const store = useStore()
const themeVars = useThemeVars()
const data = ref({
  proof: {mock: 'mock'},
  isLoading: false,
})

const props = defineProps({
  selectedProof: String,
})

const emit = defineEmits(['finished', 'isLoading'])
const isLoading = ref(false)

const saveProof = async () => {
  emit('isLoading', true)
  data.value.isLoading = true
  console.log('saving')
  const proof = store.getters['proofs/getData'][props.selectedProof].proof

  // save file locally as json
  // https://codepen.io/yuvalby74/pen/yvKeLO
  let json_ = 'data:text/json;charset=utf-8,' + JSON.stringify(proof)
  let link = document.createElement('a')
  link.setAttribute('href', encodeURI(json_))
  link.setAttribute('download', 'proof.json')
  link.click()

  data.value.isLoading = false
  emit('isLoading', false)
  emit('finished')
}

const saveProofOnChain_ = async () => {
  const proofJson = store.getters['proofs/getData'][props.selectedProof].proof
  // const ZkProgram = proofs[props.selectedProof].ZkProgram
  const SmartContractProgram = proofs[props.selectedProof].SmartContract
  const ProofOfZkProgram = proofs[props.selectedProof].ProofOfZkProgram
  const zkAppAddress = store.getters['proofs/getData'][props.selectedProof].address
  await saveProofOnChain(
    proofJson,
    ProofOfZkProgram,
    SmartContractProgram,
    zkAppAddress
  )
  emit('finished')
}

const saveProofOnChain = async (
  proofJson,
  ProofJson,
  SmartContractProgram,
  zkAppAddress
) => {

  // connect wallet
  let msgReactive = message.create("1/7 Connecting wallet 👛", { type: 'loading', duration: 10e9 })
  const accounts = await window.mina.requestAccounts()
  await window.mina.switchChain({ 
    networkID: `mina:${store.state.settings.networks[store.state.settings.selectedNetwork].networkId}`
  })

  // start loading animations
  emit('isLoading', true)
  isLoading.value = true

  // setup Mina network
  msgReactive.content = "2/7 Setting up Mina network 🛰️"
  const Network = Mina.Network({
    networkId: store.state.settings.networks[store.state.settings.selectedNetwork].networkId,
    mina: store.state.settings.networks[store.state.settings.selectedNetwork].nodeUrl,
    archive: store.state.settings.networks[store.state.settings.selectedNetwork].graphQLURL,
  });
  Mina.setActiveInstance(Network);

  // compile
  msgReactive.content = "3/7 Compiling smart contract ZK program 👩‍💻"
  await SmartContractProgram.compile();
  await sleep(500)

  // json -> proof
  msgReactive.content = "4/7 Preparing transaction data 🔄"
  const proof = await ProofJson.fromJSON(proofJson);
  console.log('proof', proof);

  // fetch on-chain state
  const zkAppAddress_ = PublicKey.fromBase58(zkAppAddress);
  let { account, error } = await fetchAccount({ publicKey: zkAppAddress_ });
  console.log('fetch account', account, error)

  try {
    // create transaction
    msgReactive.content = "5/7 Creating zk proof ⚗️"
    const tx = await Mina.transaction( async () => {
      let zkApp = new SmartContractProgram(zkAppAddress_);
      zkApp.verifyProof(proof);
    });
    await tx.prove();

    // send transaction
    msgReactive.content = "6/7 Sending transaction 📤"
    const { hash } = await window.mina.sendTransaction({
      transaction: tx.toJSON(),
      feePayer: {
        fee: '',
        memo: 'idmask.xyz',
      },
    })

    emit('finished')
    console.log('Transaction sent!', hash)
    msgReactive.content = "7/7 Transaction sent 🙌"
    msgReactive.type = 'success'
    const url = `${store.state.settings.networks[store.state.settings.selectedNetwork].blockExplorer}tx/${hash}`
    notification.success({
      content: 'Follow the transaction in block explorer 📦',
      meta: () => h('a', { href: url, target: '_blank' }, 'transaction url'),
      duration: undefined,
      keepAliveOnHover: true
    })
    isLoading.value = false
    await sleep(10000)
    message.destroyAll()
  } catch (error) {
    console.log('Err', error);
    message.destroyAll()
    message.create(
      typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : String(error),
      { type: 'error', closable: true, duration: 20000, }
    );
  } finally {
    isLoading.value = false
    emit('isLoading', false)
  };
};

</script>

<template>

  <n-space vertical :size="8" align="center" justify="center" style="min-height: 20em;">
    
    <n-text type="default">
      Save the proof
    </n-text>

    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        There are multiple ways to save it, pick the one you like.
      </p>
    </n-text>

    <n-button @click="saveProof()" type="primary">
      <template #icon>
        <n-icon :color="themeVars.textColor">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M19 13v5c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1zm-6-.33l1.88-1.88a.996.996 0 1 1 1.41 1.41l-3.59 3.59a.996.996 0 0 1-1.41 0L7.7 12.2a.996.996 0 1 1 1.41-1.41L11 12.67V4c0-.55.45-1 1-1s1 .45 1 1v8.67z" fill="currentColor"></path></svg>
        </n-icon>
      </template>
      Save as json
    </n-button>
    <n-button @click="saveProofOnChain_()" :loading="isLoading" type="primary">
      <template #icon>
        <n-icon :color="themeVars.textColor">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M440.9 136.3a4 4 0 0 0 0-6.91L288.16 40.65a64.14 64.14 0 0 0-64.33 0L71.12 129.39a4 4 0 0 0 0 6.91L254 243.88a4 4 0 0 0 4.06 0z" fill="currentColor"></path><path d="M54 163.51a4 4 0 0 0-6 3.49v173.89a48 48 0 0 0 23.84 41.39L234 479.51a4 4 0 0 0 6-3.46V274.3a4 4 0 0 0-2-3.46z" fill="currentColor"></path><path d="M272 275v201a4 4 0 0 0 6 3.46l162.15-97.23A48 48 0 0 0 464 340.89V167a4 4 0 0 0-6-3.45l-184 108a4 4 0 0 0-2 3.45z" fill="currentColor"></path></svg>
        </n-icon>
      </template>
      Put on chain
    </n-button>

    <saveProofToGoogleWallet @finished="emit('finished')" :selectedProof="props.selectedProof"/>
    <saveProofToAppleWallet :selectedProof="props.selectedProof"/>

  </n-space>

</template>

<style>

</style>
