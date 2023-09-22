<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import createProofs from './createProofs.vue'

const themeVars = useThemeVars()

const tabValue = ref('Create')
const proofs = ref([
  { name: 'Proof of Non-Sanctions', emoji: '🏛️', text: 'Prove that your name is not included on the OFAC sanctions list.', isSelected: true },
  { name: 'Proof of Adulthood', emoji: '👵',  text: 'Prove that you have lived for more than a certain number of years.',  isSelected: false },
  { name: 'Proof of Unique-human', emoji: '🧠',  text: 'Generate an exclusive identifier that is uniquely yours.',  isSelected: false }
])

const selectProof = (proofName) => {
  // mark as slected
  proofs.value = proofs.value.map(proof => ({
      ...proof,
      isSelected: (proof.name == proofName) ? true : false
    })
  )
  console.log(proofName)
}

onMounted( async () => {
  console.log('mounted')
})
</script>

<template>

  <n-divider style="width: 30%" class="centered-container" dashed/>

  <div class="centered-container" style="height: 100vh;">
    <n-space :size="30" justify="center" vertical>

      <n-space justify="center">
        <n-h1><n-gradient-text type="primary">Identity</n-gradient-text> Proofs</n-h1>
      </n-space>

      <n-space horizontal justify="center">
        <div v-for="proof in proofs">
          <n-card
            @click="selectProof(proof.name)"
            style="cursor: pointer; max-width: 18em;"
            :class="proof.isSelected ? 'selected' : ''"
          >
            <template #default>
              <n-space horizontal>
                <n-avatar :size="46">
                  <n-text style="font-size: 20px;">
                    {{ proof.emoji }}
                  </n-text>
                </n-avatar>
                <n-space vertical align="start" :size="5">
                <n-text :depth="2">
                  {{ proof.name }}
                </n-text>
                <n-text :depth="3" style="font-size: 90%">
                  {{ proof.text }}
                </n-text>
                </n-space>
              </n-space>
            </template>
          </n-card>
        </div>
      </n-space>

    <n-tabs type="segment" v-model="tabValue" animated>
      <n-tab-pane name="Create" tab="Create">
        <createProofs />
      </n-tab-pane>
      <n-tab-pane name="Consume" tab="Consume">
        <createProofs />
      </n-tab-pane>
      <n-tab-pane name="Explore" tab="Explore">
        <createProofs />
      </n-tab-pane>
    </n-tabs>

  </n-space>
  </div>

</template>

<style scoped>

.selected {
  border-width: 4px;
  border-color: v-bind(themeVars.primaryColor);
  transition: border-width 0.0s ease-in-out;
}


</style>
