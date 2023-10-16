<script setup>
import { ref } from 'vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

const props = defineProps({
  selectedProof: String,
})

const fileList = ref([])

const verifyProof = (proof) => {
  console.log('verifying: ', proof)
}

const handleUpload = ({file, event}) => {
  var reader = new FileReader()
  reader.onload = (event) => {
    try {
      var json = JSON.parse(reader.result)
    } catch (error) {
      console.error(error)
    }
    verifyProof(json)
    fileList.value = []
  }
  reader.readAsText(file.file)
}

</script>

<template>
  <br>
  <n-card
    :segmented="{ content: true, footer: 'soft' }"
    :header-extra-style="{'align-items': 'start'}"
  >
    <template #header>
      <n-space vertical :size="20">
        <div>Consume {{ props.selectedProof }}</div>
      </n-space>
    </template>
      Consuming a proof requires you to perform one of the following:

      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          1. If user saved their proof to their local device and shared a JSON file with you,
          drop it below and you'll verify if the proof is valid.
        </p>
        <n-upload :max="1" @change="handleUpload" v-model:file-list="fileList" :show-file-list="false">
          <n-upload-dragger>
            <div>
              <n-icon size="28" :depth="3">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M64 164v244a56 56 0 0 0 56 56h272a56 56 0 0 0 56-56V164a4 4 0 0 0-4-4H68a4 4 0 0 0-4 4zm267 151.63l-63.69 63.68a16 16 0 0 1-22.62 0L181 315.63c-6.09-6.09-6.65-16-.85-22.38a16 16 0 0 1 23.16-.56L240 329.37V224.45c0-8.61 6.62-16 15.23-16.43A16 16 0 0 1 272 224v105.37l36.69-36.68a16 16 0 0 1 23.16.56c5.8 6.37 5.24 16.29-.85 22.38z" fill="currentColor"></path><rect x="32" y="48" width="448" height="80" rx="32" ry="32" fill="currentColor"></rect></svg>
              </n-icon>
            </div>
            <n-text>
              Click or drag a file to this area
            </n-text>
            <n-p depth="3" style="font-size: 95%;">
              User submitted proof in the form of JSON
            </n-p>
          </n-upload-dragger>
        </n-upload>
        <p>
          2. If user saved their proof to Mina blockchain and shared their public address with you,
          then you can verify if by inputting user's public address.
        </p>
        <div>
          <n-input-group>
            <n-button type="primary">
              Verify
            </n-button>
            <n-input :style="{ width: '100%' }" />
          </n-input-group>
        </div>
      </n-text>

    <template #action>
    </template>
  </n-card>
</template>

<style>

</style>
