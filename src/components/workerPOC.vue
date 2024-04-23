<script setup>
import { computed, nextTick, ref } from 'vue'
import { useDateFormat, useTimestamp, useWebWorkerFn } from '@vueuse/core'

import { compile } from '.././components/proofSteps/compile.js'
import { proofOfAge } from './../components/zkPrograms/ProofOfAge.js'
import { useStore } from 'vuex'

const store = useStore()

const heavyTask = async () => {
  await compile(store, 'proofOfAge', proofOfAge, { useCache: false })
  return 1
}

const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(heavyTask)
const time = useTimestamp()
const computedTime = useDateFormat(time, 'YYYY-MM-DD HH:mm:ss SSS')
const running = computed(() => workerStatus.value === 'RUNNING')

const data = ref(null)
const runner = ref('')

async function baseSort() {
  data.value = null
  await nextTick()
  data.value = await heavyTask()
  runner.value = 'Main'
}

async function workerSort() {
  data.value = null
  await nextTick()
  data.value = await workerFn()
  runner.value = 'Worker'
}

</script>

<template>
  <p>Current Time: <b>{{ computedTime }}</b></p>
  <p>
    Compiling with web worker<br>
    Clock stops when UI blocking happens.
  </p>
  <button @click="baseSort">
    Compile in Main Thread
  </button>
  <button v-if="!running" @click="workerSort">
    Compile in Worker
  </button>
  <button v-else class="orange" @click="workerTerminate('PENDING')">
    Terminate Worker
  </button>
  <p v-if="data">
    Thread: <strong>{{ runner }}</strong><br>
    Result: <strong>{{ data }}</strong>
  </p>
</template>
