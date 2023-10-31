<script setup>
import { ref, h } from 'vue'
import { useThemeVars, NTag } from 'naive-ui'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'
import { verify } from 'o1js';
import { proofOfAge } from './zkPrograms/ProofOfAge.js'

const themeVars = useThemeVars()
const store = useStore()
const message = useMessage()

const props = defineProps({
  selectedProof: String,
})

const columns = ref([
  {
    title: "Name",
    key: "name"
  },
  {
    title: "Age",
    key: "age"
  },
  {
    title: "Address",
    key: "address"
  },
  {
  title: "Tags",
  key: "tags",
  render(row) {
    const tags = row.tags.map((tagKey) => {
      return h(
        NTag,
        {
          style: {
            marginRight: "6px"
          },
          type: "primary",
          bordered: false
        },
        {
          default: () => tagKey
        }
      );
    });
    return tags;
  }
}
])

const data = ref([
  {
    key: 0,
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"]
  },
  {
    key: 1,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["wow"]
  },
  {
    key: 2,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    tags: ["cool", "teacher"]
  },
  {
    key: 1,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["wow"]
  },
  {
    key: 2,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    tags: ["cool", "teacher"]
  },
  {
    key: 1,
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["wow"]
  },
  {
    key: 2,
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    tags: ["cool", "teacher"]
  }
])

</script>

<template>
  <br>
  <n-card
    :segmented="{ content: true, footer: 'soft' }"
    :header-extra-style="{'align-items': 'start'}"
  >
    <template #header>
      <n-space vertical :size="20">
        <div>Explore {{ props.selectedProof }}</div>
      </n-space>
    </template>

      Its possible to explore proofs that are put on chain. Proofs save to user's device stay private.

      <n-text :depth="3" style="font-size: 90%; text-align: justify;">
        <p>
          Below are all of the proofs created and put on-chain. These addresses have certainly have asociated proofs.
        </p>
      </n-text>

      <n-data-table
        :bordered="true"
        :columns="columns"
        :data="data"
        :pagination="{ pageSize: 5 }"
      />

    <template #action>
    </template>
  </n-card>
</template>

<style>

</style>
