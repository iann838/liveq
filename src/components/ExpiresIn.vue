<template>
    <span v-if="expiresIn > 0">
        {{new Date(expiresIn).getMinutes().toString().padStart(2, '0')}}:<!--
        -->{{new Date(expiresIn).getSeconds().toString().padStart(2, '0')}}
    </span>
    <span v-else>Closed</span>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue'

const expiresAt = defineModel<number>({ required: true })
const expiresIn = ref(expiresAt.value - Date.now())

const emit = defineEmits(['update'])

const interval = setInterval(() => {
    expiresIn.value = expiresAt.value - Date.now()
    emit('update', expiresIn.value)
}, 10)

onBeforeUnmount(() => {
    clearInterval(interval)
})
</script>
