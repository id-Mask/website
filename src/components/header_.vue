<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useIsMobile } from '../utils'

const themeVars = useThemeVars()
const isMobile = useIsMobile()
const emits = defineEmits(['logoClick'])


</script>

<template>
  <n-layout-header bordered>
    <n-page-header style="padding: 1em 2em 1em 2em;">
      <template #title>
        <!-- <a href="/" style="text-decoration: none; color: inherit">
          <b>MINA protocol</b> <n-text depth="3"><br> Node dashboard</n-text>
        </a> -->
      </template>
      <template #header>
      </template>
      <template #avatar>
        <!-- <n-element>
          <n-avatar :size="64" class="logo" @click="$emit('logoClick')">
            <n-text style="font-size: 36px;">
              🦸
            </n-text>
          </n-avatar>
        </n-element> -->
      </template>
      <template #extra>
        <n-space horizontal>
          <n-button tertiary type="primary" size="large" tag="a" href="https://id-mask.gitbook.io/" target="_blank">
            <template #icon>
              <n-icon :color="themeVars.primaryColor">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M18.5 20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10zm-5-15.379L17.378 8.5H14a.5.5 0 0 1-.5-.5V4.621zm5.914 3.793l-5.829-5.828c-.026-.026-.058-.046-.085-.07a2.072 2.072 0 0 0-.219-.18c-.04-.027-.086-.045-.128-.068c-.071-.04-.141-.084-.216-.116a1.977 1.977 0 0 0-.624-.138C12.266 2.011 12.22 2 12.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414z" fill="currentColor"></path></g></svg>
              </n-icon>
            </template>
            Docs
          </n-button>
        </n-space>
      </template>
      <template #footer>
      </template>
    </n-page-header>
  </n-layout-header>
</template>

<style scoped>
</style>
