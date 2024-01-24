<script setup>
import { ref } from 'vue';
import { QrcodeStream } from 'vue-qrcode-reader'

const decodedValue = ref('');
const isOpen = ref(false);

const onDetect = (value) => {
  decodedValue.value = value.map((code) => JSON.parse(code.rawValue))
  isOpen.value = false
};

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = 'red'

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()
  }
};

</script>

<template>
  <n-button type="primary" @click="isOpen = !isOpen">scan QR code
  </n-button>
  <div v-if="isOpen">
    <qrcode-stream @detect="onDetect" :track="paintOutline" @errors="console.error" />
  </div>
  <p v-if="decodedValue">{{ decodedValue }}</p>
</template>

<style>

</style>
