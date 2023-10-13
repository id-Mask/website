<script setup>
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'

// hljs stuff
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('json', json)

const themeVars = useThemeVars()

const jsonData = ref({
  numberKey: 123456,
  stringKey: 'askdjhasd'
})

</script>

<template>
  <n-code :code="JSON.stringify(jsonData, null, 2)" :hljs="hljs" language="json" class="code" style="white-space: nowrap;"/>
</template>

<style scoped>
.code {
  font-family: "JetBrains Mono";
  font-size: 90%;
}

.hljs-punctuation {
  color: v-bind(themeVars.textColor3) !important;
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
</style>
