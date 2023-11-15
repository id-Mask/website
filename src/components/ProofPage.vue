<script setup>
import { ref, onBeforeMount } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'
import proofCard from './proofCard.vue'
import verifyCard from './verifyCard.vue'
import exploreCard from './exploreCard.vue'

const themeVars = useThemeVars()
const store = useStore()

const tabValue = ref('Create')
const proofs = ref([])

const selectProof = (proofName) => {
  // mark as slected
  proofs.value = proofs.value.map(proof => ({
      ...proof,
      isSelected: (proof.name == proofName) ? true : false
    })
  )
}

onBeforeMount( async () => {
  /*
    Before mounting get the data from the store.
    We want to have an array of proofs, e.g.
    [
      {
        name: '',
        displayName: '',
        emoji: '',
        text: '',
        isSelected: bool
      },
      ...
    ]
  */
  const data = store.getters['proofs/getData']
  proofs.value = Object.keys(data).map(key => {
    return {
      name: key,
      displayName: data[key].displayName,
      emoji: data[key].emoji,
      text: data[key].text,
      isSelected: false,
    };
  });

  // set first proof to selected
  selectProof(Object.keys(data)[0])
})

</script>

<template>
  <n-divider style="width: 30%" dashed class="centered-element" />
  <div style="padding: 8em 0em;">
    <n-space :size="30" justify="center" vertical>

      <n-space justify="center">
        <n-h1>
          <n-gradient-text
            type="primary"
            :gradient="{ from: themeVars.primaryColorHover, to: themeVars.primaryColor, deg: 90 }"
          >Identity</n-gradient-text>
          Proofs
        </n-h1>
      </n-space>

      <n-space horizontal justify="center">
        <n-grid x-gap="12" y-gap="12" cols="xs:1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen">
          <n-gi v-for="proof in proofs">
            <n-card
              @click="selectProof(proof.name)"
              style="cursor: pointer;"
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
                    {{ proof.displayName }}
                  </n-text>
                  <n-text :depth="3" style="font-size: 90%">
                    {{ proof.text }}
                  </n-text>
                  </n-space>
                </n-space>
              </template>
            </n-card>
          </n-gi>
        </n-grid>
      </n-space>

      <n-tabs type="segment" v-model="tabValue" animated>
        <n-tab-pane name="Create" tab="Create" display-directive="show">
          <KeepAlive>
            <proofCard :selectedProof="proofs.filter((proof) => proof.isSelected)[0].name" />
          </KeepAlive>
        </n-tab-pane>
        <n-tab-pane name="Verify" tab="Verify" display-directive="show">
          <verifyCard :selectedProof="proofs.filter((proof) => proof.isSelected)[0].name" />
        </n-tab-pane>
        <n-tab-pane name="Explore" tab="Explore" display-directive="show:lazy">
          <exploreCard :selectedProof="proofs.filter((proof) => proof.isSelected)[0].name" />
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

.centered-element {
  margin-left: auto;
  margin-right: auto;
  display: block;
}

</style>
