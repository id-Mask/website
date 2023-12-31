<script setup>
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { verify } from 'o1js';

import { proofOfAge } from './zkPrograms/ProofOfAge.js'
import { proofOfSanctions } from './zkPrograms/ProofOfSanctions.js'
const proofs = {
  proofOfAge: proofOfAge,
  proofOfSanctions: proofOfSanctions
}

const themeVars = useThemeVars()
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

  // check if the proof is compiled and vk saved
  // if not compile and save verificationKey to store
  if (!store.state.proofs.data[props.selectedProof].verificationKey) {
    message.loading('Please be patient. Before verification the program must be compiled.')
    const { verificationKey } = await proofs[props.selectedProof].compile()
    store.state.proofs.data[props.selectedProof].verificationKey = verificationKey
  }

  // verify if the provided proof is correct
  let msg = message.loading('verifying', { closable: true, duration: 10000 })
  try {
    let ok = await verify(proof, store.state.proofs.data[props.selectedProof].verificationKey);
    if (ok) {
      msg.type = 'success'
      msg.content = 'Provided proof is valid'
      modalData.value = proof.publicOutput
      showModal.value = true
    } else {
      msg.type = 'error'
      msg.content = 'Failed to verify the proof'
    }
  } catch (error) {
    msg.type = 'error'
    msg.content = 'Something is wrong.'
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
    // fileList.value = []
  }
  reader.readAsText(file.file)
}

const verifyOnChainProof = async () => {

  const checkIfAddressHasProof = async (URL, zkAppAddress, address) => {
    const response = await fetch(URL, {
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
                    body: {publicKey: "${zkAppAddress}"}
                  },
                  feePayer: {
                    body: {
                      publicKey: "${address}"
                    }
                  }
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
              }
            }
          }
        `,
      }),
    })
    const response_ = await response.json()
    return response_
  }

  isLoading.value = true
  let msg = message.loading('verifying', { closable: true, duration: 10000 })

  const zkAppAddress = store.state.proofs.data[props.selectedProof].address
  const URL = store.getters['settings/getGraphQlEnpoint']

  try {
    let response = await checkIfAddressHasProof(URL, zkAppAddress, address.value)
    let events = response.data.events.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    let ok = events.length > 0 ? true : false
    if (ok) {
      msg.type = 'success'
      msg.content = 'Provided address has a proof'
      modalData.value = events[0].event
      showModal.value = true
    } else {
      msg.type = 'error'
      msg.content = 'Failed to find the proof asociated with the address'
    }
  } catch (error) {
    msg.type = 'error'
    msg.content = `Something is wrong: ${error}`
  }
  isLoading.value = false

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
      <n-space vertical :size="20">
        <div>Verify {{ mapping[props.selectedProof] }}</div>
      </n-space>
    </template>
      Verifying a proof requires you to perform one of the following:

      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          1. If user saved their proof to their local device and shared a JSON file with you,
          drop it below and you'll verify if the proof is valid.
        </p>
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
        <p>
          2. If user saved their proof to Mina blockchain and shared their public address with you,
          then you can verify if by inputting user's public address.
        </p>
        <div>
          <n-input-group>
            <n-button type="primary" @click="verifyOnChainProof" :loading="isLoading">
              Verify
            </n-button>
            <n-input :style="{ width: '100%' }" v-model:value="address" placeholder="Mina address" />
          </n-input-group>
        </div>
      </n-text>

    <template #action>
    </template>
  </n-card>

  <n-modal v-model:show="showModal">
    <n-card
      style="max-width: 350px"
      title="Verified proof data"
      :bordered="true"
    >
      <n-space justify="center">
      <n-p :depth="3">
        Provided proof is valid, below is the data that it carries
      </n-p>

      <n-scrollbar style="max-height: 200px">
      <n-h2>
        <n-text type="primary">
          {{ modalData }}
        </n-text>
      </n-h2>
      </n-scrollbar>
    </n-space>
    </n-card>
  </n-modal>

</template>

<style>

</style>
