<script setup>
import { ref, onMounted } from 'vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()
const data = ref({
  proof: {mock: 'mock'},
  isLoading: false,
})

const emit = defineEmits(['finished'])

const saveProof = async () => {
    data.value.isLoading = true
    console.log('saving')
    data.value.isLoading = false
    emit('finished')
}

onMounted(async () => {
})

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Save the proof
    </n-text>

    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        You have two options how you can save the proof you've just created. Choose one depending on your use case.
      </p>
      <p>
        If you save it as as JSON to your device, you can later share it with third parties and they will consume it and verify it themselves.
      </p>
      <p>
        If you save it to the Mina blockchain, the network will verify it and you will be able to share your proof by simply referencing your Mina blockchain public address.
      </p>
    </n-text>

    <n-space>
      <n-button>
        <template #icon>
          <n-icon :color="themeVars.primaryColor">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M19 13v5c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1zm-6-.33l1.88-1.88a.996.996 0 1 1 1.41 1.41l-3.59 3.59a.996.996 0 0 1-1.41 0L7.7 12.2a.996.996 0 1 1 1.41-1.41L11 12.67V4c0-.55.45-1 1-1s1 .45 1 1v8.67z" fill="currentColor"></path></svg>
          </n-icon>
        </template>
        Save as json
      </n-button>
      <n-button>
        <template #icon>
          <n-icon :color="themeVars.primaryColor">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M440.9 136.3a4 4 0 0 0 0-6.91L288.16 40.65a64.14 64.14 0 0 0-64.33 0L71.12 129.39a4 4 0 0 0 0 6.91L254 243.88a4 4 0 0 0 4.06 0z" fill="currentColor"></path><path d="M54 163.51a4 4 0 0 0-6 3.49v173.89a48 48 0 0 0 23.84 41.39L234 479.51a4 4 0 0 0 6-3.46V274.3a4 4 0 0 0-2-3.46z" fill="currentColor"></path><path d="M272 275v201a4 4 0 0 0 6 3.46l162.15-97.23A48 48 0 0 0 464 340.89V167a4 4 0 0 0-6-3.45l-184 108a4 4 0 0 0-2 3.45z" fill="currentColor"></path></svg>
          </n-icon>
        </template>
        Put on chain
      </n-button>
    </n-space>

  </n-space>

</template>

<style>

</style>
