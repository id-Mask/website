<script setup>
import { computed, ref, provide } from 'vue'
import { useStore } from 'vuex'
import { useBreakpoint } from 'vooks'

import header_ from './components/header_.vue'
import LandingPage from './components/LandingPage.vue'
import ProofPage from './components/ProofPage.vue'
import footer_ from './components/footer_.vue'
import ProofOwnershipValidation from './components/componentUtils/proofOwnershipValidation.vue'
import PasskeysChallengePage from './components/componentUtils/passkeysChallengePage.vue'

const store = useStore()
const breakpoint = useBreakpoint()
const loadingBarTargetRef = ref(void 0)
provide('loadingBarTargetRef', loadingBarTargetRef)

const padding = computed(() => {
  const breakpoints = {
    'xs': '0em 2em',
    's': '0em 6em',
    'm': '0em 15em',
    'l': '0em 20em',
    'xl': '0em 30em',
    'xxl': '0em 40em',
    '2xl': '0em 40em',
  };
  return breakpoints[breakpoint.value]
    ? `padding: ${breakpoints[breakpoint.value]};`
    : '';
})

const route = computed(() => {
  return window.location.pathname
})

</script>

<template>

  <n-config-provider :theme="store.getters['theme/getTheme']" :theme-overrides="store.getters['theme/getThemeOverrides']">
    <n-notification-provider placement='bottom-right'>
      <n-loading-bar-provider :to="loadingBarTargetRef" container-style="position: absolute;">
        <n-message-provider>

          <!-- 
            Instead of using vue router which is I think overly complicated for this single use case,
            lets create a single route manually. By default, there are no routes, but if the route is
            equal to /proofOwnershipValidation, then it will render one specific component and nothing else. 
          -->

          <span v-if="route == '/proofOwnershipValidation'">
            <ProofOwnershipValidation/>
          </span>
          <span v-else-if="route == '/passkeysChallengePage'">
            <PasskeysChallengePage/>
          </span>
          <span v-else>
            <n-layout>
              <header_ style="position: absolute; z-index: 1;"/>
              <n-layout-content :content-style="'margin: 0 auto;' + padding">
                <LandingPage/>
                <ProofPage/>
              </n-layout-content>
            </n-layout>
            <n-layout-footer bordered>
              <footer_ :style="padding + 'padding-top: 5em; padding-bottom: 5em;'"/>
            </n-layout-footer>
          </span>

        </n-message-provider>
      </n-loading-bar-provider>
    </n-notification-provider>
  </n-config-provider>

</template>

<style scoped>
</style>
