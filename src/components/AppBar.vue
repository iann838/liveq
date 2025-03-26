<template>
    <v-app-bar :elevation="0" class="px-0 border-b">
        <v-btn
            color="grey-lighten-1"
            @click="onBack ? onBack(() => router.go(-1)): router.go(-1)"
        >
            <v-icon icon="mdi-chevron-left"></v-icon>
            <span class="pl-1" v-if="!$vuetify.display.mobile">Back</span>
        </v-btn>
        <v-btn class="mx-auto" style="font-size: 20px" to="/" variant="text">
            LiveQ
        </v-btn>

        <slot></slot>
    </v-app-bar>
</template>

<script lang="ts" setup>
import router from '@/router'

const { onBack } = defineProps<{ onBack: (cb: () => void) => any }>()
</script>
