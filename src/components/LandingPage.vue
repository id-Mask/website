<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

// emoji configs
const emoji = ref('')
const blurEmoji = ref(false)

// Id-Mask char loop
const word = ref('Mask')
const words = ['Mask']
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzM '

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const loopOverWords = async () => {

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

const loopOverEmojis = async () => {

  const emojis = [
    "👩‍⚕️", "👩‍🎓", "👩‍🏫", "👩‍⚖️", "👩‍🌾", "👩‍🍳", "👩‍🔧", "👩‍🏭", "👩‍💼", "👩‍🔬", "👩‍💻",
    "👩‍🎤", "👩‍🎨", "🧑‍🚀", "🧑‍🚒", "👮‍♂️", "🕵️‍♂️", "💂‍♂️", "👷", "🫅", "🤵", "👰",
    "🎅", "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🧟"
  ]

  // a bit of a side thing, but lets also set favicon value
  const favicon = document.getElementById('favicon')

  while (true) {
    const randomIndex = Math.floor(Math.random() * emojis.length)
    emoji.value = emojis[randomIndex]
    favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22
      viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>
      ${emojis[randomIndex]}</text></svg>`
    await sleep(4000)
  }
}

const applyRandomEmojiBlur = async () => {
  while (true) {
    blurEmoji.value = false
    await sleep(5000)
    blurEmoji.value = true
    await sleep(2000)
  }
}

onMounted( async () => {
  loopOverWords()
  loopOverEmojis()
  applyRandomEmojiBlur()
})
</script>

<template>

  <div class="centered-container" style="height: 100vh;">
    <div class="shine1" style="width: 90em;">
      <n-space vertical align="center" class="prevent-select">
        <n-text style="font-size: 300%" class="shine2 shine3" :class="[blurEmoji ? 'blur' : '']">{{ emoji }}</n-text>
        <n-text style="font-size: 300%" class="shine2 shine3" id="text1">Id-{{ word }}</n-text>
        <n-text style="font-size: 130%" depth="3" class="shine2 shine3">
          zk-powered-<n-gradient-text type="primary">identity</n-gradient-text>
        </n-text>
      </n-space>
    </div>
  </div>

</template>

<style scoped>

.blur {
  filter: blur(4px);
  transition: color 1s ease, text-shadow 1s ease;
}

.shine1 {
  will-change: filter;
  transition: filter 600ms;
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
