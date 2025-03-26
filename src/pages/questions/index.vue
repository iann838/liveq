<template>
    <div class="d-flex w-100 flex-column flex-lg-row position-relative">
        <app-bar :on-back="(cb: () => void) => createQuestionPanel? createQuestionPanel = false: cb()">
            <v-btn color="primary" @click="createQuestionPanel = true">
                <v-icon icon="mdi-plus"></v-icon>
                <span class="pl-1" v-if="!$vuetify.display.mobile">Create</span>
            </v-btn>
        </app-bar>
        <v-container class="overflow-y-auto">
            <div v-if="createQuestionPanel">
                <question-input
                    @cancel="createQuestionPanel = false"
                    @success="(question: Question) => router.push(`/questions/${question.id}`)"
                />
            </div>
            <div v-else>
                <h1 class="font-weight-light">Manage Questions</h1>
                <v-divider class="mb-5 mt-2"></v-divider>
                <div v-if="loading" style="padding-top: 35vh">
                    <h3 class="text-center">Loading</h3>
                    <v-progress-linear
                        class="mt-5 mx-auto"
                        style="width: 200px"
                        color="primary"
                        indeterminate
                        rounded
                        height="5"
                    ></v-progress-linear>
                </div>
                <div v-else-if="!questions.length && pageNum == 1">
                    <div class="text-center text-grey-lighten-1" style="padding: 20vh 0">
                        <div><v-icon icon="mdi-message-off-outline" class="text-grey-darken-2" size="60"></v-icon></div>
                        <div class="mt-5">No questions available</div>
                        <div class="mt-3">
                            <v-btn
                                size="small"
                                variant="tonal"
                                color="primary"
                                @click="createQuestionPanel = true"
                            >
                                <v-icon icon="mdi-plus"></v-icon>
                                <span class="pl-1">Create a question</span>
                            </v-btn>
                        </div>
                    </div>
                </div>
                <div v-else-if="!questions.length">
                    <div class="text-center text-grey-lighten-1" style="padding: 20vh 0">
                        <div><v-icon icon="mdi-message-off-outline" class="text-grey-darken-2" size="60"></v-icon></div>
                        <div class="mt-5">This page is empty</div>
                        <div class="mt-3">
                            <v-btn
                                size="small"
                                variant="tonal"
                                color="primary"
                                @click="pageNum = 1"
                            >
                                <v-icon icon="mdi-chevron-left"></v-icon>
                                <span class="pl-1">Go back to page 1</span>
                            </v-btn>
                        </div>
                    </div>
                </div>
                <v-row v-else>
                    <v-col
                        v-for="question in questions"
                        :key="question.id"
                        :cols="12"
                        :md="6"
                        :lg="4"
                    >
                        <v-card>
                            <div class="pb-2" :style="{backgroundColor: hashColor(question.id)}">
                                <v-card-title>{{question.title}}</v-card-title>
                                <v-card-subtitle>
                                    <span v-if="question.variant == 'open'">Open Answers</span>
                                    <span v-if="question.variant == 'single'">Single Choice</span>
                                    <span v-if="question.variant == 'multi'">Multi Choice</span>
                                    [Duration: {{ (question.duration / 60000).toFixed(0) }}min]
                                </v-card-subtitle>
                            </div>
                            <v-card-text class="d-flex align-center">
                                <v-icon icon="mdi-forum-outline"></v-icon>
                                <span class="ml-1">{{ question.answerCount }}</span>
                                <v-icon icon="mdi-clock-minus-outline" class="ml-8"></v-icon>
                                <expires-in class="ml-1" v-model="question.expiresAt"/>    
                                <v-icon class="ml-8">mdi-asterisk</v-icon>
                                <span class="ml-1 text-pre">{{ question?.id.match(/.{1,4}/g)!.join("  ") }}</span>
                            </v-card-text>
                            <v-card-actions class="mt-n3">
                                <v-btn color="primary" :to="`/questions/${question.id}`">
                                    View
                                    <v-icon class="ml-1 mt-1">mdi-arrow-right</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
                <v-responsive max-width="320" class="mx-auto">
                    <v-pagination
                        v-model="pageNum"
                        class="mt-5"
                        density="compact"
                        :length="pageNum + (questions.length == pageSize ? 1: 0)"
                    ></v-pagination>
                </v-responsive>
            </div>
        </v-container>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Question } from '@/dtypes'
import { hashColor, jsonFetch } from '@/utils'
import { state, error } from '@/state'

const router = useRouter()

if (!state.authToken)
    router.push("/")

const loading = ref(true)
const questions = ref<Question[]>([])
const createQuestionPanel = ref(false)
const pageNum = ref(1)
const pageSize = 12

readQuestions()

async function readQuestions() {
    const questionsRes = await jsonFetch(`/api2/questions?offset=${(pageNum.value - 1) * pageSize}&limit=${pageSize}`)
    if (questionsRes.status == 200) {
        questions.value = await questionsRes.json()
    } else {
        await error.putResponse(questionsRes, "Failed to fetch questions: ")
    }
    loading.value = false
}

watch(pageNum, readQuestions)

</script>