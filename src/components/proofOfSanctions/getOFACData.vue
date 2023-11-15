<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import hidableDataWindow from './../componentUtils/hidableDataWindow.vue'

const emit = defineEmits(['finished'])
const store = useStore()

const data = reactive({
  minScore: 95,
  isLoading: false
})

const getData = async () => {

  data.isLoading = true
  store.state.sanctions.data = null

  const url = store.state.settings.zkOracle
  const response = await fetch(url + 'getOFACmatches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...store.state.pid.data,
      minScore: data.minScore,
    }),
  })
  const response_ = await response.json()
  store.state.sanctions.data = response_

  data.isLoading = false
  emit('finished')
}

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Check your personal identification data against the OFAC database.
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        To perform the check the following personal identification data is used:
        1. your first name,
        2. your last name,
        3. your PNO (date of birth),
        4. your nationality.
      </p>
      <p>
        You can specify the minimum similarity score (min score) used during the check to make it more or less strict.
        You can read more about it <a href="https://ofac.treasury.gov/faqs/248" target_="blank">here</a>.
        We recommend a value of 95 or higher.
      </p>
    </n-text>

    <n-input-group>
      <n-button type="primary" @click="getData()" :loading="data.isLoading">
        Check
      </n-button>
      <n-input-group-label>min score</n-input-group-label>
      <n-input-number
        style="width: 100%"
        v-model:value="data.minScore"
        placeholder="minimum similarity score"
        :show-button="false"
      />
    </n-input-group>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="store.state.sanctions.data || data.isLoading">
        <template #action>
          <hidableDataWindow
            text="OFAC matches:"
            :data="JSON.stringify(store.state.sanctions.data, null, 2)"
            :blur="false"
          />
        </template>
      </n-card>
    </n-spin>

    <div v-if="store.state.sanctions.data">
      <div v-if="!store.state.sanctions.data.data.isMatched">
        <n-alert title="" type="success" style="margin-top: 15px;">
          <template #header>
            <n-text :depth="0" style="font-size: 90%; text-align: justify;">
              Success: Your data does not match any of the OFAC entries
            </n-text>
          </template>
        </n-alert>
      </div>

      <div v-else>
        <n-alert title="" type="error" style="margin-top: 15px;">
          <template #header>
            <n-text :depth="0" style="font-size: 90%; text-align: justify;">
              OFAC match found
            </n-text>
          </template>
        </n-alert>
      </div>
    </div>

  </n-space>

</template>

<style>

</style>
