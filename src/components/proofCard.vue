<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import getPersonalData from './proofSteps/getPersonalData.vue'
import getOFACData from './proofSteps/getOFACData.vue'
import compileProgram from './proofSteps/compileProgram.vue'
import createProofOfAge from './proofSteps/createProofOfAge.vue'
import createProofOfSanctions from './proofSteps/createProofOfSanctions.vue'
import createProofOfUniqueHuman from './proofSteps/createProofOfUniqueHuman.vue'
import saveProof from './proofSteps/saveProof.vue'

const store = useStore()
const props = defineProps({
  selectedProof: String,
})

// to make sure this is not inside a ref
const components = {
  getPersonalData: getPersonalData,
  getOFACData: getOFACData,
  compileProgram: compileProgram,
  createProofOfAge: createProofOfAge,
  createProofOfSanctions: createProofOfSanctions,
  createProofOfUniqueHuman: createProofOfUniqueHuman,
  saveProof: saveProof,
}


// make sure there's a global instance with unified keys. ProofPage should be ground truth. Here should inherit.
const proofs = ref({
  proofOfAge: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'compileProgram', finished: false },
      { component: 'createProofOfAge', finished: false },
      { component: 'saveProof', finished: false },
    ]
  },
  proofOfSanctions: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'compileProgram', finished: false },
      { component: 'getOFACData', finished: false },
      { component: 'createProofOfSanctions', finished: false },
      { component: 'saveProof', finished: false },
    ]
  },
  proofOfUniqueHuman: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'compileProgram', finished: false },
      { component: 'createProofOfUniqueHuman', finished: false },
      { component: 'saveProof', finished: false },
    ]
  }
})

// map proof key to it's display name
const mapping = ref({})
const proofData = store.getters['proofs/getData']
Object.keys(proofData).forEach(key => {
  mapping.value[key] = proofData[key].displayName;
});

const currentStep = ref(0)
const isLoading = ref(false)

const setFinished = (val) => {
  proofs.value[props.selectedProof].steps[getCurrentStep()].finished = val ?? true

  // set as finished for other proofs as well..?
  // only set if the step has the same component name
  // in practive this will only be the first stop, I guess..?
  // This might have to be refactored later, not a perfect design.
  const stepName = proofs.value[props.selectedProof].steps[getCurrentStep()].component
  for (let proof in proofs.value) {
    for (let step = 0; step < proofs.value[proof].steps.length; step++) {
      if (proofs.value[proof].steps[step].component == stepName) {
        proofs.value[proof].steps[step].finished = val ?? true
      }
    }
  }
}

const setLoading = (val) => {
  isLoading.value = val
}

const getCurrentStep = () => {
  // whenever we switch from one proof to another, it might be the case that
  // previously selected proof had more steps that newly selected proof
  // thats why in such case we must move to maxStepLength instad of currentStep
  const maxStepLength = proofs.value[props.selectedProof].steps.length - 1
  
  const fixCurrentStep = () => {
    // TODO:
    // on proof switch must go the the last step that is finished where no 
    // previous steps are unfinished.

    // but before all this:
    // must manually check if compileStep has a compiled the proof else, by switching
    // in between steps, we might end up in a step ahead, withought having the program 
    // compiled

    const isCompiled = store.state.proofs.data[props.selectedProof].verificationKey != null
    const steps = proofs.value[props.selectedProof].steps.map(step => 
      step.component.includes('compile') ? isCompiled : step.finished
    )

    const lastTrueIndex = (arr) => {
      const lastIndex = arr.lastIndexOf(true, arr.findIndex(value => value === false) + 1)
      return lastIndex === -1 ? 0 : lastIndex
    }
    const lastFinishedStep = lastTrueIndex(steps)

    const step = currentStep.value > maxStepLength ? maxStepLength : currentStep.value
    const step_ = lastFinishedStep + 1 < currentStep.value ? lastFinishedStep : step

    console.log(currentStep.value, lastFinishedStep, step, step_)
  }


  return currentStep.value > maxStepLength ? maxStepLength : currentStep.value
}

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
          <div>Create {{ mapping[props.selectedProof] }}</div>
          <n-space horizontal align="start">
            <n-collapse-transition :show="proofs[props.selectedProof].steps[getCurrentStep()].finished">
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
        :processing="isLoading"
      />
    </n-space>
    </template>

    <!-- https://vuejs.org/guide/built-ins/keep-alive.html#basic-usage -->
    <KeepAlive>
      <component
        :is="components[proofs[props.selectedProof].steps[getCurrentStep()].component]"
        @finished="(val) => setFinished(val)"
        @isLoading="(val) => setLoading(val)"
        :selectedProof="props.selectedProof"
      />
    </KeepAlive>

    <template #action>
      <n-space justify="center">
        <n-button
          size="medium"
          tertiary
          type="primary"
          @click="currentStep == 0 ? false : currentStep --"
          :disabled="currentStep == 0"
        >
          <template #icon>
            <n-icon size="25">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" fill="currentColor"></path></svg>
            </n-icon>
          </template>
        </n-button>
        <n-button
          tertiary
          size="medium"
          type="primary"
          @click="currentStep >= (proofs[props.selectedProof].steps.length - 1) ? false : currentStep ++"
          :disabled="!proofs[props.selectedProof].steps[getCurrentStep()].finished || (currentStep == (proofs[props.selectedProof].steps.length - 1))"
        >
          <template #icon>
            <n-icon size="25">
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
.hljs-number {
  color: #5F5FEAFF !important;
}

</style>
