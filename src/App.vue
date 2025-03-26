<template>
    <v-app>
        <v-main>
            <router-view :key="$route.fullPath"/>
            <v-slide-x-reverse-transition>
                <v-alert
                    v-if="error.message"
                    type="error"
                    variant="elevated"
                    elevation="10"
                    class="position-absolute ma-5 v-col-10 v-col-lg-5"
                    density="compact"
                    style="right: 0; top: 0; z-index: 10000000;"
                >
                    {{error.message}}
                    <div v-if="error.items?.length">
                        <div v-for="(errorStr, i) in error.items" :key="i">
                            - <span class="text-capitalize">{{errorStr}}</span>
                        </div>
                    </div>
                </v-alert>
            </v-slide-x-reverse-transition>
        </v-main>
    </v-app>
</template>

<style>
.v-application {
    background-color: #1b1b1b !important;
}

body {
    max-width: 100vw;
    overflow-x: hidden;
}

.panel-height {
    min-height: calc(100dvh - 65px);
    height: calc(100dvh - 65px);
    max-height: calc(100dvh - 65px);
}

.position-relative {
    position: relative;
}

.position-absolute {
    position: absolute;
}

.overflow-y-auto {
    overflow-y: auto;
}

.hide-scroll-bar {
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on touch devices */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}
</style>

<script lang="ts" setup>
import { error } from '@/state'
</script>
