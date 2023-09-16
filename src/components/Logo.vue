<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'


// TODO:
//  1. Scale on hover
//  2. Auto hover on mobile and loop over the items 
const themeVars = useThemeVars()

const word = ref('Mask')
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzM '
const words = [
  'Mask',
]

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const replaceOrAddCharacter = (str, idx, repl) => {
  // add
  if (idx > str.length) {
    return str + repl
  }
  // replace
  let start = str.substring(0, idx)
  let end = str.substring(idx + 1, str.length)
  return start + repl + end
}

const loopOverWords = async () => {
  while (true) {

    for (let next_word_idx = 0; next_word_idx < words.length; next_word_idx++) {

      // loop over current word chars
      let next_word = words[next_word_idx]
      let max_length = Math.max(word.value.length, next_word.length)
      for (let idx = 0; idx < max_length; idx++) {

        // slice the alphabet so that it ends at the char that we need
        let alphabet_ = alphabet.slice(0, alphabet.indexOf(next_word[idx]) + 1)

        // if current word is longer than next word
        // keep the full aphabet with a space at the end
        if (idx + 1 > next_word.length) {
          alphabet_ = alphabet
        }

        // loop over current char and change update it as per alphabet
        for (let idx_ = 0; idx_ < alphabet_.length; idx_++) {
          await sleep(26)
          word.value = replaceOrAddCharacter(word.value, idx, alphabet_[idx_])
        }
      }

      // wait a bit before next word
      await sleep(6000)
    }
  }
}

onMounted( async () => {
  loopOverWords()
})
</script>

<template>

  <div class="center-container">
    <div class="shine1" style="width: 90em;">
      <n-space vertical align="center">
        <n-h1 class="shine2 shine3">🦸</n-h1>
        <n-h1 class="shine2 shine3">id-{{ word }}</n-h1>
        <n-text depth="3" class="shine2 shine3">
          zk-powered-<n-gradient-text type="primary">identity</n-gradient-text>
        </n-text>
      </n-space>
    </div>
  </div>

</template>

<style scoped>

.center-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.shine1 {
  will-change: filter;
  transition: filter 600ms;
}
.shine1:hover {
  filter: drop-shadow(0 0 2em v-bind(themeVars.primaryColor));
}

.shine2 {
  will-change: filter;
  transition: filter 800ms;
}
.shine2:hover {
  filter: drop-shadow(0 0 2em v-bind(themeVars.infoColor));
}

.shine3 {
  will-change: filter;
  transition: filter 900ms;
}
.shine3:hover {
  filter: drop-shadow(0 0 1em v-bind(themeVars.infoColor));
}

</style>
