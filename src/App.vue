<script setup>
import { useStore } from 'vuex'
import { NThemeEditor } from 'naive-ui'

const store = useStore()

import header_ from './components/header_.vue'
import LandingPage from './components/LandingPage.vue'
import mainPage from './components/mainPage.vue'
import footer_ from './components/footer_.vue'

</script>

<template>

  <n-config-provider :theme="store.getters['theme/getTheme']" :theme-overrides="store.getters['theme/getThemeOverrides']">
    <n-theme-editor>
      <n-notification-provider>
        <n-loading-bar-provider>

          <n-layout>
            <header_ style="position: absolute; z-index: 1;"/>
            <n-layout-content style="padding: 0 2rem;">
              <LandingPage/>
              <mainPage/>
            </n-layout-content>
          </n-layout>
          <n-layout-footer bordered>
            <footer_ />
          </n-layout-footer>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-theme-editor>
  </n-config-provider>

</template>

<style scoped>
</style>
