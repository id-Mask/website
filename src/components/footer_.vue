<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useStore } from 'vuex'

const themeVars = useThemeVars()
const store = useStore()

const proofs = store.getters['proofs/getData']

const shortenAddress = (address) => {
  return address.slice(0, 5) + '...' + address.slice(-5)
}

const addressToUrl = (address) => {
  return store.getters['settings/getBlockExplorerEnpoint'] + 'account/' + address
}

</script>

<template>
    <n-space justify="space-between">
      <div>
        <n-h4>Backed by:</n-h4>
        <n-divider />
        <n-space vertical>
          <div v-for="item in ['Mina', 'zkIgnite']">
            <n-text :depth="3" style="font-size: 90%;">
              {{ item }}
            </n-text>
          </div>
        </n-space>
        <br>
      </div>
      <div>
        <n-h4>zkApp Contracts:</n-h4>
        <n-divider />
        <n-space vertical>
          <div v-for="proof in Object.keys(proofs)">
            <div v-if="proofs[proof].address">
              <n-text :depth="3" style="font-size: 90%;">
                {{ proofs[proof].displayName }}
                <a :href="addressToUrl(proofs[proof].address)" target="_blank">
                  {{ shortenAddress(proofs[proof].address) }}
                </a>
              </n-text>
            </div>
          </div>
        </n-space>
      </div>
    </n-space>
</template>

<style scoped>
.reduce-text-size {
  font-size: 90%;
}
</style>
