<template>
  <a :href="href" class="group -m-1 p-1" v-bind="$attrs">
    <slot />
  </a>
</template>

<script setup>
defineProps({
  href: {
    type: String,
    required: true,
  },
})
</script>
