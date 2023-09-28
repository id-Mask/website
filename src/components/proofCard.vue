<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import getPersonalData from './proofOfSanctions/getPersonalData.vue'
import getOFACData from './proofOfSanctions/getOFACData.vue'

const props = defineProps({
  selectedProof: String,
})

// to make sure this is not inside a ref
const components = {
  'getPersonalData': getPersonalData,
  'getOFACData': getOFACData,
}

const proofs = ref({
  'Proof of Non-Sanctions': {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'getOFACData', finished: false },
      // { component: 'compileZKP' },
      // { component: 'createProof' },
      // { component: 'saveProof' },
    ]
  },
  'Proof of Adulthood': {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'getOFACData', finished: false },
      // { component: 'compileZKP' },
      // { component: 'createProof' },
      // { component: 'saveProof' },
    ]
  },
  'Proof of Unique-human': {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'getOFACData', finished: false },
      // { component: 'compileZKP' },
      // { component: 'createProof' },
      // { component: 'saveProof' },
    ]
  }
})

const currentStep = ref(0)

const setFinished = () => {
  proofs.value[props.selectedProof].steps[currentStep.value].finished = true

  // set as finished for other proofs as well..?
  // only set if the step has the same component name
  // in practive this will only be the first stop, I guess..?
  // This might have to be refactored later, I dont thik this is good design.
  const stepName = proofs.value[props.selectedProof].steps[currentStep.value].component
  for (let proof in proofs.value) {
    for (let step = 0; step < proofs.value[proof].steps.length; step++) {
      if (proofs.value[proof].steps[step].component == stepName) {
        proofs.value[proof].steps[step].finished = true
      }
    }
  }
}

onMounted( async () => {
  console.log('createProofs mounted')
})

</script>

<template>
  <br>
  <n-card
    :segmented="{ content: true, footer: 'soft' }"
    :header-extra-style="{'align-items': 'start'}"
  >
    <template #header>
      <n-space vertical :size="20">
        <n-space justify="space-between">
          <div>Create {{ props.selectedProof }}</div>
          <n-space horizontal align="start">
            <n-collapse-transition :show="proofs[props.selectedProof].steps[currentStep].finished">
            <n-icon-wrapper>
              <n-icon :size="18">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0a.984.984 0 0 0 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7a.984.984 0 0 0 0-1.4a.984.984 0 0 0-1.4 0L9 16.2z" fill="currentColor"></path></svg>
              </n-icon>
            </n-icon-wrapper>
            </n-collapse-transition>
            {{ currentStep + 1 }} /
            {{ proofs[props.selectedProof].steps.length }}
          </n-space>
        </n-space>
      <n-progress
        style="margin: 0 0px 12px 0"
        type="line"
        :show-indicator="false"
        status="success"
        :percentage="(
          proofs[props.selectedProof].steps.filter(step => step.finished).length /
          proofs[props.selectedProof].steps.length
        ) * 100"
      />
    </n-space>
    </template>

    <!-- https://vuejs.org/guide/built-ins/keep-alive.html#basic-usage -->
    <KeepAlive>
      <component
        :is="components[proofs[props.selectedProof].steps[currentStep].component]"
        @finished="setFinished()"
      />
    </KeepAlive>

    <template #action>
      <n-space>
        <n-button
          tertiary
          type="primary"
          @click="currentStep == 0 ? false : currentStep --"
        >
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" fill="currentColor"></path></svg>
            </n-icon>
          </template>
        </n-button>
        <n-button
          tertiary
          type="primary"
          @click="currentStep >= (proofs[props.selectedProof].steps.length - 1) ? false : currentStep ++"
          :disabled="!proofs[props.selectedProof].steps[currentStep].finished"
        >
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4l-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" fill="currentColor"></path></svg>
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<style>

.hljs-key {
  color: #5F5FEAFF !important;
}
.hljs-string {
  color: #5F5FEAFF !important;
}

</style>
