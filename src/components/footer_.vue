<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useThemeVars } from 'naive-ui'
import legal from './legal.vue'

const store = useStore()
const themeVars = useThemeVars()

const proofs = store.getters['proofs/getData']

const status = ref({
  zkOracle: {
    status: false,
    isLoading: true,
  },
  graphQl: {
    status: false,
    isLoading: true,
  }
})

const backedBy = [
  { name: 'MINA Protocol', url: 'https://minaprotocol.com/' },
  { name: 'zkIgnite Cohort 2', url: 'https://zkignite.minaprotocol.com/' }
]

const shortenAddress = (address) => {
  return address.slice(0, 5) + '...' + address.slice(-5)
}

const addressToUrl = (address) => {
  return store.getters['settings/getBlockExplorerEnpoint'] + 'account/' + address
}

const getEndpointStatus = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    return response.status == 200 ? true : false
  } catch (error) {
    return false
  }
}

const getGraphQLBody = () => {
  const queries = {
    minascan: 'query MyQuery {events(input: {address: \"\"}) {blockInfo {chainStatus}}}',
    minaexplorer: 'query MyQuery {block {blockHeight}}'
  }
  const isMinascan = store.state.settings.graphQLURL.includes('minascan')
  const query = isMinascan ? queries.minascan : queries.minaexplorer
  return JSON.stringify({ query: query })
}

const updateStatus = async () => {
  await Promise.all([

    // zkOracle
    (async () => {
      status.value.zkOracle.isLoading = true
      const result = await getEndpointStatus(
        store.state.settings.zkOracle + 'ping'
      )
      status.value.zkOracle.status = result
      status.value.zkOracle.isLoading = false
    })(),

    // graphQL
    (async () => {
      status.value.graphQl.isLoading = true
      const result = await getEndpointStatus(
        store.state.settings.graphQLURL,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json'},
          body: getGraphQLBody(),
        }
      )
      status.value.graphQl.status = result
      status.value.graphQl.isLoading = false
    })(),

  ])
}

onMounted(async () => {
  await updateStatus()
})

</script>

<template>
  <div>
    <n-space justify="center" :size="[100, 50]" style="text-align: center;">
      <div>
        <n-h4>Backed by:</n-h4>
        <n-divider />
        <n-space vertical>
          <div v-for="item in backedBy">
            <n-text :depth="3" style="font-size: 90%;">
              <a :href="item.url" target="_blank"> {{ item.name }} </a>
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
      <div>
        <n-h4>Source code:</n-h4>
        <n-divider />
        <n-space vertical>
          <n-button circle type="tertiary" tag="a" href="https://github.com/id-Mask" target="_blank">
            <n-icon size="20">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6c-3.3.3-5.6-1.3-5.6-3.6c0-2 2.3-3.6 5.2-3.6c3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9c2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9c.3 2 2.9 3.3 5.9 2.6c2.9-.7 4.9-2.6 4.6-4.6c-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2c12.8 2.3 17.3-5.6 17.3-12.1c0-6.2-.3-40.4-.3-61.4c0 0-70 15-84.7-29.8c0 0-11.4-29.1-27.8-36.6c0 0-22.9-15.7 1.6-15.4c0 0 24.9 2 38.6 25.8c21.9 38.6 58.6 27.5 72.9 20.9c2.3-16 8.8-27.1 16-33.7c-55.9-6.2-112.3-14.3-112.3-110.5c0-27.5 7.6-41.3 23.6-58.9c-2.6-6.5-11.1-33.3 2.6-67.9c20.9-6.5 69 27 69 27c20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27c13.7 34.7 5.2 61.4 2.6 67.9c16 17.7 25.8 31.5 25.8 58.9c0 96.5-58.9 104.2-114.8 110.5c9.2 7.9 17 22.9 17 46.4c0 33.7-.3 75.4-.3 83.6c0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252C496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2c1.6 1.6 3.9 2.3 5.2 1c1.3-1 1-3.3-.7-5.2c-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9c1.6 1 3.6.7 4.3-.7c.7-1.3-.3-2.9-2.3-3.9c-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2c2.3 2.3 5.2 2.6 6.5 1c1.3-1.3.7-4.3-1.3-6.2c-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9c1.6 2.3 4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2c-1.4-2.3-4-3.3-5.6-2z" fill="currentColor"></path></svg>
            </n-icon>
          </n-button>
        </n-space>
      </div>
    </n-space>

    <n-divider style="width: 60%; margin-left: auto; margin-right: auto;"/>

    <n-space justify="center" style="text-align: center; cursor: pointer;" vertical @click="updateStatus()">
      <div>
        <n-text depth="3" style="font-size: 10px;">zkOracle status </n-text>
        <template v-if="status.zkOracle.isLoading">
          <template class="gray-dot" />
        </template>
        <template v-else>
          <template :class="status.zkOracle.status ? 'green-dot' : 'red-dot'" />
        </template>
      </div>
      <div>
        <n-text depth="3" style="font-size: 10px;">Mina GraphQL status </n-text>
        <template v-if="status.graphQl.isLoading">
          <template class="gray-dot" />
        </template>
        <template v-else>
          <template :class="status.graphQl.status ? 'green-dot' : 'red-dot'" />
        </template>
      </div>
    </n-space>

    <n-divider style="width: 60%; margin-left: auto; margin-right: auto;"/>

    <n-space justify="center" style="text-align: center;" vertical>
      <div>
        <n-text depth="3" style="font-size: 10px;">
          NPM package: <br/>
          <a href="https://www.npmjs.com/package/idmask-zk-programs" target="_blank">idmask-zk-programs</a>
        </n-text>
      </div>
    </n-space>

    <n-divider style="width: 60%; margin-left: auto; margin-right: auto;"/>
    <legal />

  </div>
</template>

<style scoped>

.green-dot {
  height: 6px;
  width: 6px;
  background-color: rgb(8, 220, 47);
  border-radius: 50%;
  display: inline-block;
}

.red-dot {
  height: 6px;
  width: 6px;
  background-color: v-bind(themeVars.errorColor);
  border-radius: 50%;
  display: inline-block;
}

.gray-dot {
  height: 6px;
  width: 6px;
  background-color: v-bind(themeVars.iconColorDisabled);
  border-radius: 50%;
  display: inline-block;
}
</style>
