<script setup>
import { useStore } from 'vuex'
import { NThemeEditor } from 'naive-ui'
import { useBreakpoint } from 'vooks'

import header_ from './components/header_.vue'
import LandingPage from './components/LandingPage.vue'
import mainPage from './components/mainPage.vue'
import footer_ from './components/footer_.vue'

const store = useStore()
const breakpoint = useBreakpoint()

</script>

<template>

  <n-config-provider :theme="store.getters['theme/getTheme']" :theme-overrides="store.getters['theme/getThemeOverrides']">
    <n-theme-editor>
      <n-notification-provider>
        <n-loading-bar-provider>

          <n-layout>
            <header_ style="position: absolute; z-index: 1;"/>
            <n-layout-content
            :content-style="
               'margin: 0 auto;' +
                 (['xs'].includes(breakpoint) ? 'padding: 0em 2em;' : '') +
                 (['s'].includes(breakpoint) ? 'padding: 0em 3em;' : '') +
                 (['m'].includes(breakpoint)  ? 'padding: 0em 6em;' : '') +
                 (['l'].includes(breakpoint)  ? 'padding: 0em 10em;' : '') +
                 (['xl'].includes(breakpoint)  ? 'padding: 0em 30em;' : '') +
                 (['xxl', '2xl'].includes(breakpoint)  ? 'padding: 0em 40em;' : '')
               "
            >
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
