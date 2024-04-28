<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import getPersonalData from './proofSteps/getPersonalData.vue'
import createProofOfAge from './proofSteps/createProofOfAge.vue'
import createProofOfSanctions from './proofSteps/createProofOfSanctions.vue'
import createProofOfUniqueHuman from './proofSteps/createProofOfUniqueHuman.vue'
import createProofOfNationality from './proofSteps/createProofOfNationality.vue'
import saveProof from './proofSteps/saveProof.vue'
import { useIsMobile } from '../utils.js'
import { useLoadingBar } from 'naive-ui';


const loadingBar = useLoadingBar()
const store = useStore()
const isMobile = useIsMobile()
const props = defineProps({
  selectedProof: String,
})

// to make sure this is not inside a ref
const components = {
  getPersonalData: getPersonalData,
  createProofOfAge: createProofOfAge,
  createProofOfSanctions: createProofOfSanctions,
  createProofOfUniqueHuman: createProofOfUniqueHuman,
  createProofOfNationality: createProofOfNationality,
  saveProof: saveProof,
}


// make sure there's a global instance with unified keys. ProofPage should be ground truth. Here should inherit.
const proofs = ref({
  proofOfAge: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'createProofOfAge', finished: false },
      { component: 'saveProof', finished: false },
    ]
  },
  proofOfSanctions: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'createProofOfSanctions', finished: false },
      { component: 'saveProof', finished: false },
    ]
  },
  proofOfUniqueHuman: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'createProofOfUniqueHuman', finished: false },
      { component: 'saveProof', finished: false },
    ]
  },
  proofOfNationality: {
    steps: [
      { component: 'getPersonalData', finished: false },
      { component: 'createProofOfNationality', finished: false },
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

  // abort if step name not getPersonalData
  // we don't want to set finished to for example save proof step
  if (stepName != 'getPersonalData') {
    return
  }

  for (let proof in proofs.value) {
    for (let step = 0; step < proofs.value[proof].steps.length; step++) {
      if (proofs.value[proof].steps[step].component == stepName) {
        proofs.value[proof].steps[step].finished = val ?? true
      }
    }
  }
}

const setLoading = (val) => {
  if (val) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
  isLoading.value = val
}

const getCurrentStep = () => {
  const maxStepLength = proofs.value[props.selectedProof].steps.length - 1
  return currentStep.value > maxStepLength ? maxStepLength : currentStep.value
}

const triggerNextStep_ = () => {
  if (currentStep.value < (proofs.value[props.selectedProof].steps.length - 1)) {
    currentStep.value ++
  }
}

watch(() => props.selectedProof, () => {
  // whanever the user picks another proof
  // go the the last consecutive finished step
  // TODO: this is overly complicated. must refactor this at some point.
  let lastIndex = 0;
  for (let i = 0; i <= proofs.value[props.selectedProof].steps.length - 1; i++) {
    if (proofs.value[props.selectedProof].steps[i].finished === true) {
      lastIndex += 1;
    } else if (lastIndex !== 0) {
      break;
    }
  }

  // make sure do not select over the last step, i.e. max is always len of steps
  currentStep.value = Math.min(lastIndex, proofs.value[props.selectedProof].steps.length - 1)
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
        <n-space :justify="isMobile ? 'center' : 'space-between'">
          <div>Create {{ mapping[props.selectedProof] }}</div>
          <n-space horizontal align="start">
            <n-collapse-transition :show="proofs[props.selectedProof].steps[getCurrentStep()].finished">
              <n-icon-wrapper>
                <n-icon :size="14">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0a.984.984 0 0 0 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7a.984.984 0 0 0 0-1.4a.984.984 0 0 0-1.4 0L9 16.2z" fill="currentColor"></path></svg>
                </n-icon>
              </n-icon-wrapper>
            </n-collapse-transition>
            <n-spin :size="15" v-if="isLoading" style="padding-top: 4px;"/>
            <span v-else>
              <n-button 
                quaternary 
                size="small" 
                style="padding: 5px;"
                @click="currentStep == 0 ? false : currentStep --"
              >
                <template #icon>
                  <n-icon :size="16">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16"><g fill="none"><path d="M10.354 3.146a.5.5 0 0 1 0 .708L6.207 8l4.147 4.146a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 0 1 .708 0z" fill="currentColor"></path></g></svg>
                  </n-icon>
                </template>
                <n-text style="font-size: 124%;">{{ currentStep + 1 }}</n-text>
              </n-button>
            </span> 
            <n-text style="font-size: 95%">/</n-text>
            <n-button 
              quaternary 
              size="small" 
              icon-placement="right" 
              style="padding: 5px;"
              @click="currentStep >= (proofs[props.selectedProof].steps.length - 1) ? false : currentStep ++"
            >
              <template #icon>
                <n-icon :size="16">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M7.646 4.147a.5.5 0 0 1 .707-.001l5.484 5.465a.55.55 0 0 1 0 .779l-5.484 5.465a.5.5 0 0 1-.706-.708L12.812 10L7.647 4.854a.5.5 0 0 1-.001-.707z" fill="currentColor"></path></g></svg>
                </n-icon>
              </template>
              <n-text style="font-size: 120%;">{{ proofs[props.selectedProof].steps.length }}</n-text>
            </n-button>
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
        @triggerNextStep="triggerNextStep_()"
        :selectedProof="props.selectedProof"
      />
    </KeepAlive>
    <br/>
    <template #action>
    </template>
  </n-card>
</template>

<style>

</style>
