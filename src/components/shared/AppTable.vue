<script setup lang="ts">
import { defineProps } from "vue";

type AppTableRow = Record<string, string>;

defineProps<{ columns: string[]; rows: AppTableRow[] }>();
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-[#E9DFC9] bg-white shadow-sm">
    <table class="w-full min-w-full border-collapse text-left text-sm">
      <thead class="bg-[#F5F2EB] text-[#2C1A11]">
        <tr>
          <th v-for="column in columns" :key="column" class="px-5 py-4 font-semibold">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-t border-[#F0E8D6] hover:bg-[#FBF7EE]">
          <td v-for="column in columns" :key="column" class="px-5 py-4 text-[#4B3A2A]">
            {{ row[column] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
