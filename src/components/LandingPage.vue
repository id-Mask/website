<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useIsMobile } from '../utils'
import { useStore } from 'vuex'
import { sleep } from './../utils.js'

const themeVars = useThemeVars()
const store = useStore()
const isMobile = useIsMobile()

// emoji configs
const emoji = ref('')
const blurEmoji = ref(false)

// Id-Mask char loop
const word = ref('Mask')
const words = ['Mask']
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzM '

// intro text taht will be 'typed'
const texts = ref([
  {
    'text': 'Prove statements about yourself without revealing any personal details. Sounds',
    'placeholder': ''
  },
  {
    'text': 'like magic?',
    'placeholder': ''
  },
  {
    'text': 'While it might sound like it, the aim is to make it unremarkable everyday reality, not a distant technology. Give it a try below.',
    'placeholder': ''
  },
])

const typeText = async () => {
  for (let i = 0; i < texts.value.length; i++) {
    for (const char of texts.value[i].text) {
      texts.value[i].placeholder += char
      await sleep(10)
    }
  }
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
    store.dispatch('settings/changeEmoji', emojis[randomIndex])
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
    await sleep(5000)
  }
}

onMounted( async () => {
  loopOverWords()
  typeText()
  loopOverEmojis()
  applyRandomEmojiBlur()
})

defineExpose({
  emoji,
})

</script>

<template>
  <div :style="(isMobile ? 'padding-top: 10em; height: 70vh;' : 'padding-top: 20em; height: 65vh')">
    <n-space vertical align="center">
      <div class="shine1">
        <n-space vertical align="center" class="prevent-select shine1">
          <n-text style="font-size: 300%" class="shine2 shine3" :class="[blurEmoji ? 'blur' : '']">{{ emoji }}</n-text>
          <n-text style="font-size: 300%" class="shine2 shine3" id="text1">Id-{{ word }}</n-text>
          <n-text style="font-size: 130%" depth="3" class="shine2 shine3">
            zk-powered-<n-gradient-text
                type="primary"
                :gradient="{ from: themeVars.primaryColorHover, to: themeVars.primaryColor, deg: 90 }"
              >
              identity
            </n-gradient-text>
          </n-text>
          <br><br>
        </n-space>
      </div>
      <n-card style="max-width: 25em;" class="scale-on-hover card-shine">
        <n-text style="font-size: 90%;" depth="3">
          <div style="text-align: justify;">
            <p>
              {{ texts[0].placeholder }}
              <n-gradient-text
                type="primary"
                :gradient="{ from: themeVars.primaryColorHover, to: themeVars.primaryColor, deg: 90 }"
              >
                {{ texts[1].placeholder }}
              </n-gradient-text>
            </p>
            <p>
              {{ texts[2].placeholder }}
            </p>
          </div>
        </n-text>
      </n-card>
    </n-space>
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

.scale-on-hover {
  transition: transform .8s;
}

.scale-on-hover:hover {
  transform: scale(1.05);
}

.card-shine {
  filter: drop-shadow(0 0 0.5em v-bind(themeVars.primaryColor));
}

</style>
