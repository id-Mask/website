<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

onMounted( async () => {
  console.log('footer mounted')
})


</script>

<template>
  <div class="centered-text" style="height: 25vh;">
  </div>
</template>

<style scoped>
</style>
