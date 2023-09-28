<script setup>
import { ref, reactive } from 'vue'
import hidableDataWindow from './../componentUtils/hidableDataWindow.vue'

const data = reactive({
  data: null,
  isLoading: false
})

</script>

<template>

  <n-space vertical>
    <n-text type="default">
      Verify whether your personal identification data matches any entries in the OFAC database.
    </n-text>
    <n-text :depth="3" style="font-size: 90%; text-align: justify;">
      <p>
        To perform the verification, the following personal identification data is shared with the API:
        1. your first name,
        2. your last name,
        3. your date of birth,
        4. your nationality (optional), and
        5. your personal identification number (optional).
        When you submit this data to the API and perform the verification, the API will
        return list of individuals on the OFAC database that match your data.
      </p>
    </n-text>
    <n-button type="primary">Verify</n-button>

    <n-spin :show="data.isLoading" style="padding-top: 1.3em;">
      <n-card v-if="data.data || data.isLoading">
        <template #action>
          <hidableDataWindow
            text="OFAC matches:"
            :data="JSON.stringify(data.data, null, 2)"
          />
        </template>
      </n-card>
    </n-spin>

  </n-space>

</template>

<style>

</style>
