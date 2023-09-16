<script setup>
import { useStore } from 'vuex'

const store = useStore()

import header_ from './components/header_.vue'
import Logo from './components/Logo.vue'

const logoClick = () => {
  console.log('logo click')
}

</script>

<template>
  <n-config-provider :theme="store.getters['theme/getTheme']" :theme-overrides="store.getters['theme/getThemeOverrides']">
    <n-notification-provider>
      <n-loading-bar-provider>

        <n-layout>
          <header_ @logoClick="logoClick" style="position: absolute; z-index: 1;"/>
          <n-layout-content style="padding: 0 2rem;">
            <Logo/>
          </n-layout-content>
        </n-layout>

      </n-loading-bar-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
