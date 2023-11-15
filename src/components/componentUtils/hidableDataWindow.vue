<script setup>
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'

// hljs stuff
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

const themeVars = useThemeVars()
const blur = ref(true)

const props = defineProps({
  text: String,
  data: String,
  blur: { type: Boolean, required: false, default: true },
})

</script>

<template>
  <n-space justify="space-between" align="start">
    {{ props.text }}
    <n-button v-if="props.blur" strong secondary type="tertiary" size="small" @click="blur = !blur">
      <template #icon>
        <n-icon :size="20">
          <svg v-if="data.blurData" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M12 19c-4 0-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7c-.42.736-.858 1.414-1.311 2.033"></path><path d="M15 19l2 2l4-4"></path></g></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512C791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 0 0 0-51.5zm-63.57-320.64L836 122.88a8 8 0 0 0-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 0 0 0 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 0 0 0 11.31L155.17 889a8 8 0 0 0 11.31 0l712.15-712.12a8 8 0 0 0 0-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 0 0-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 0 1 146.2-106.69L401.31 546.2A112 112 0 0 1 396 512z" fill="currentColor"></path><path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 0 0 227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 0 1-112 112z" fill="currentColor"></path></svg>
        </n-icon>
      </template>
    </n-button>
  </n-space>
  <div :style="props.blur ? '' : 'padding-top: 7px;'" />
  <n-scrollbar x-scrollable>
    <n-code
      :code="props.data"
      :hljs="hljs"
      language="json"
      class="code"
      :class="props.blur ? (blur ? 'blur' : '') : ''"
      style="white-space: nowrap;"
    />
  </n-scrollbar>
</template>

<style>

.code {
  font-family: "JetBrains Mono";
  font-size: 90%;
}

.hljs-punctuation {
  color: v-bind(themeVars.textColor1) !important;
}

.hljs-attr {
  color: v-bind(themeVars.textColor3) !important;
}

.hljs-number {
  color: v-bind(themeVars.primaryColor) !important;
}

.hljs-string {
  color: v-bind(themeVars.primaryColor) !important;
}

.blur {
  filter: blur(3px);
  -webkit-filter: blur(3px);
}

</style>
