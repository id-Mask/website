<script setup>
import { ref } from 'vue';
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

const decodedValue = ref('');
const isOpen = ref(false)

const onDecode = (value) => {
  decodedValue.value = value;
  console.log(decodedValue.value)
};

</script>

<template>
  <n-button type="primary" @click="isOpen = !isOpen">scan QR code
  </n-button>
  <div v-if="isOpen">
    <qrcode-stream @decode="onDecode" />
    <p v-if="decodedValue">{{ decodedValue }}</p>
  </div>
</template>

<style>

</style>
