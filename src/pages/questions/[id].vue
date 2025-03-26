<template>
    <div class="d-flex w-100 flex-column flex-lg-row">
        <app-bar :on-back="(cb: () => void) => editQuestionPanel? editQuestionPanel = false: cb()">
            <v-dialog max-width="380">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-btn v-bind="activatorProps" color="primary">
                        <v-icon>mdi-dots-horizontal-circle-outline</v-icon>
                        <span class="pl-2" v-if="!$vuetify.display.mobile">
                            {{ isHostAuthed ? 'Actions': 'More' }}
                        </span>
                    </v-btn>
                </template>

                <template v-slot:default="{ isActive }">
                    <v-card title="Details" :loading="dialogLoading">
                        <template v-slot:append>
                            <v-icon @click="isActive.value=false">mdi-close</v-icon>
                        </template>
                        <v-card-text v-if="question">
                            <div>
                                <b>ID</b>: {{ question.id.match(/.{1,4}/g)!.join("  ") }}
                                    <v-icon @click="copyToClipboard(question.id)" size="18" class="ml-1" >mdi-content-copy</v-icon>
                                    <br>
                                <b>Host</b>: {{ question.hostEmail }} <br>
                                <b>Variant</b>: {{ question.variant.toUpperCase() }} <br>
                                <b>ExpiresAt</b>: {{ new Date(question.expiresAt).toLocaleString() }} <br>
                                <b>UpdatedAt</b>: {{ new Date(question.updatedAt).toLocaleString() }} <br>
                            </div>
                            <div v-if="isHostAuthed">
                                <v-divider class="mt-3"></v-divider>
                                <v-card-title class="px-0">Actions</v-card-title>
                                <v-btn
                                    variant="tonal"
                                    color="primary"
                                    class="mb-2 mr-2"
                                    @click="exportAnswers"
                                    :loading="dialogLoading"
                                >Export Answers</v-btn>
                                <div class="mb-4 mt-1" style="line-height: 1;">
                                    <small><b>Openning access, editing question and deleting question</b> will also delete all existing answers,
                                    please ensure you have <b>exported</b> them if needed.</small>
                                </div>
                                <v-btn
                                    v-if="varExpiresIn <= 0"
                                    variant="tonal"
                                    color="light-green"
                                    class="mb-2 mr-2"
                                    @click="openQuestion().then(() => isActive.value = false)"
                                    :loading="dialogLoading"
                                >Open Access</v-btn>
                                <v-btn
                                    v-else
                                    variant="tonal"
                                    color="red"
                                    class="mb-2 mr-2"
                                    @click="closeQuestion().then(() => isActive.value = false)"
                                    :loading="dialogLoading"
                                >Close Access</v-btn>
                                <v-btn
                                    variant="tonal"
                                    color="cyan"
                                    class="mb-2 mr-2"
                                    :disabled="question.expiresAt > Date.now()"
                                    @click="editQuestionPanel = true; isActive.value = false"
                                    :loading="dialogLoading"
                                >Edit Question</v-btn>
                                <v-btn
                                    variant="tonal"
                                    color="error"
                                    class="mb-2 mr-2"
                                    :disabled="question.expiresAt > Date.now()"
                                    :loading="dialogLoading"
                                    @click="deleteQuestion"
                                >Delete Question</v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </template>
            </v-dialog>
        </app-bar>
        
        <div v-if="loading" style="padding-top: 35vh" class="mx-auto">
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
        <v-container v-if="question && editQuestionPanel">
            <question-input
                :updating="question"
                @cancel="editQuestionPanel = false"
                @success="editQuestionPanel = false; readQuestion().then(() => readAnswers())"
            />
        </v-container>
        <v-container v-else-if="question" class="panel-height position-relative pa-0">

            <v-expansion-panels
                v-model="answerTopExpanded"
                class="position-absolute"
                style="box-shadow: 0 20px 12px 0 #1b1b1bff;"
            >
                <v-expansion-panel
                    :bg-color="hashColor(question.id)"
                    class="text-white"
                >
                    <v-expansion-panel-title class="pt-5">
                        <div class="d-flex align-center w-100 pr-3 pr-md-10">
                            <h3 class="pr-10">{{question.title}}</h3>

                            <div class="ml-auto d-flex flex-column flex-md-row text-no-wrap">
                                <div>
                                    <v-icon class="ml-3 ml-md-10">mdi-forum-outline</v-icon>
                                    <span class="ml-1">{{ answers.length || question.answerCount }}</span>
                                </div>
    
                                <div>
                                    <v-icon class="ml-3 ml-md-10">mdi-clock-minus-outline</v-icon>
                                    <expires-in
                                        v-model="question.expiresAt"
                                        class="ml-1"
                                        @update="(v: number) => varExpiresIn = v"
                                    />
                                </div>
    
                                <div>
                                    <v-icon class="ml-3 ml-md-10">mdi-asterisk</v-icon>
                                    <span class="ml-1 text-pre">{{ question?.id.match(/.{1,4}/g)!.join("  ") }}</span>
                                </div>
                            </div>

                        </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text style="max-height: calc(100vh-400px);" class="overflow-y-auto">
                        <div style="white-space: pre-line;">
                            {{question.body}}
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-card class="position-absolute w-100" style="bottom: 0;">
                <v-card-text class="py-2" >
                    <v-text-field
                        v-if="answers.find((a) => answerIsSelf(a))"
                        :label="'You answered: ' + formatAnswer(answers.find((a) => answerIsSelf(a))!.answer)"
                        density="compact"
                        variant="outlined"
                        hide-details
                        append-icon="mdi-send"
                        disabled
                    ></v-text-field>
                    <v-text-field
                        v-else-if="varExpiresIn <= 0"
                        label="Question answering is closed"
                        density="compact"
                        variant="outlined"
                        hide-details
                        append-icon="mdi-send"
                        disabled
                    ></v-text-field>
                    <v-select
                        v-else-if="question.variant == 'single'"
                        v-model="answer"
                        label="Select Answer [Single-Choice]"
                        :items="Object.keys(question.choices).map((i) => { return { i, v: letters[parseInt(i)] } })"
                        item-title="v"
                        item-value="i"
                        density="compact"
                        variant="outlined"
                        hide-details
                        append-icon="mdi-send"
                        :loading="answerLoading"
                        :disabled="answerLoading"
                        @click:append="createAnswer"
                        @keyup.enter="createAnswer"
                    ></v-select>
                    <v-select
                        v-else-if="question.variant == 'multi'"
                        v-model="multiAnswer"
                        label="Select Answer(s) [Multi-Choice]"
                        :items="Object.keys(question.choices).map((i) => { return { i, v: letters[parseInt(i)] } })"
                        item-title="v"
                        item-value="i"
                        density="compact"
                        variant="outlined"
                        hide-details
                        multiple
                        chips
                        append-icon="mdi-send"
                        :loading="answerLoading"
                        :disabled="answerLoading"
                        @click:append="createAnswer"
                        @keyup.enter="createAnswer"
                    ></v-select>
                    <v-text-field
                        v-else-if="!openAnswerLineOverflow"
                        v-model="answer"
                        label="Answer"
                        density="compact"
                        variant="outlined"
                        hide-details
                        append-icon="mdi-send"
                        :loading="answerLoading"
                        :disabled="answerLoading"
                        autofocus
                        @click:append="createAnswer"
                        @keyup.enter="createAnswer"
                    ></v-text-field>
                    <v-textarea
                        v-else
                        v-model="answer"
                        label="Answer"
                        density="compact"
                        variant="outlined"
                        hide-details
                        append-icon="mdi-send"
                        rows="3"
                        :loading="answerLoading"
                        :disabled="answerLoading"
                        autofocus
                        no-resize
                        @click:append="createAnswer"
                        @keyup.enter="createAnswer"
                    ></v-textarea>
                </v-card-text>
            </v-card>

            <div
                id="answers"
                class="justify-end overflow-y-auto hide-scroll-bar px-4"
                :style="{ maxHeight: openAnswerLineOverflow? 'calc(100% - 110px)': 'calc(100% - 60px)' }"
            >
                <div style="padding-top: calc(100vh - 230px);"></div>
                <div
                    v-if="question.variant == 'open'"
                    v-for="answer in (answers.length? answers: defaultAnswers)"
                    :key="answer.id"
                    :class="[answerIsSelf(answer) ? 'text-end pl-9': 'text-start pr-9', 'my-2']"
                >
                    <div class="px-2">
                        <small v-if="answerIsSelf(answer) && answer.createdAt" class="text-grey-lighten-1 mr-2">
                            {{new Date(answer.createdAt).getHours().toString().padStart(2, '0')}}:<!-- 
                            -->{{new Date(answer.createdAt).getMinutes().toString().padStart(2, '0')}}
                        </small>
                        {{answer.answererName}} <span v-if="answerIsSelf(answer)">(You)</span>
                        <small v-if="!(answerIsSelf(answer)) && answer.createdAt" class="text-grey-lighten-1 ml-2">
                            {{new Date(answer.createdAt).getHours().toString().padStart(2, '0')}}:<!-- 
                            -->{{new Date(answer.createdAt).getMinutes().toString().padStart(2, '0')}}
                        </small>
                    </div>
                    <v-chip
                        class="px-5 py-3 mt-2 text-wrap rounded-xl"
                        :color="answerIsSelf(answer) ? 'light-green-lighten-4': 'cyan-lighten-4'"
                        size="x-large-chip"
                    >
                        <v-progress-linear
                            v-if="!answer.answer"
                            class="d-inline-block mt-3 mb-2"
                            style="width: 120px"
                            indeterminate
                        ></v-progress-linear>
                        <span v-else>{{ answer.answer }}</span>
                    </v-chip>
                </div>
                <div
                    v-else
                    v-for="(choice, i) in question.choices"
                    class="my-1"
                    :key="i"
                >
                    <div>
                        <v-chip density="compact" size="small" class="mr-1">{{ letters[i] }}</v-chip> {{ choice }}
                    </div>
                    <v-progress-linear
                        color="cyan"
                        :model-value="choiceAnswerCounts[i].count"
                        :max="Math.max(maxChoiceAnswerCount, 1)"
                        class="mt-1"
                        height="30px"
                    >
                        <span style="text-shadow: 2px 1px 3px rgba(0, 0, 0, 1)">
                            {{ choiceAnswerCounts[i].count }}
                        </span>
                    </v-progress-linear>
                    <div class="text-grey-lighten-1 text-truncate">
                        <small>Answered: {{ choiceAnswerCounts[i].answerersInfo.join(", ") || "None" }}</small>
                    </div>
                </div>
            </div>

        </v-container>
    </div>
</template>

<script lang="ts" setup>
import type { Answer, Question } from '@/dtypes'
import router from '@/router'
import { state, error, user } from '@/state'
import { copyToClipboard, hashColor, jsonFetch } from '@/utils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { id } = route.params as { id: string }
if (id.includes(" ")) {
    router.push(`/questions/${id.replaceAll(" ", "")}`)
}

const loading = ref(true)
const question = ref<Question | null>(null)
const answers = ref<Answer[]>([])
const answerLoading = ref(false)
const answerTopExpanded = ref([0, 1])
const answer = ref("")
const multiAnswer = computed({
    get: () => answer.value ? answer.value.split(","): [],
    set: (m: string[]) => answer.value = m.join(",")
})
const maxChoiceAnswerCount = ref(0)
const choiceAnswerCounts = computed(() => {
    if (!question.value?.choices.length)
        return []
    const counts: { count: number, answerersInfo: string[] }[] = []
    Array(question.value?.choices.length).fill(0).forEach(() => counts.push({ count: 0, answerersInfo: [] }))
    for (const answer of answers.value) {``
        const choiceIdxs = question.value?.variant == 'single'
            ? [parseInt(answer.answer)]
            : answer.answer.split(",").map((a) => parseInt(a))
        for (const choiceIdx of choiceIdxs) {
            counts[choiceIdx].count += 1
            counts[choiceIdx].answerersInfo.unshift(
                "[" +
                    new Date(answer.createdAt).getHours().toString().padStart(2, '0') +
                    ":" +
                    new Date(answer.createdAt).getMinutes().toString().padStart(2, '0') +
                "] " +
                answer.answererName
            )
        }
    }
    for (const count of counts) {
        maxChoiceAnswerCount.value = Math.max(count.count, maxChoiceAnswerCount.value)
    }
    return counts
})
const varExpiresIn = ref(0)
const isHostAuthed = computed(() => user.value?.email == question.value?.hostEmail)
const defaultAnswers: Answer[] = [{
    id: -1,
    answererEmail: "none",
    answererName: 'System',
    answer: `No one has answered anything yet...`,
    createdAt: Date.now(),
}]
const openAnswerLineOverflow = computed(() => answer.value.length > Math.max(window.innerWidth / 15, 32))
const dialogLoading = ref(false)
const editQuestionPanel = ref(false)

readQuestion()
.then(() => readAnswers().then(() => scrollAnswers()))

const l2 = setInterval(() => {
    readAnswers()
}, 10000)

// before unmount hook
onBeforeUnmount(() => {
    clearInterval(l2)
})

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]

async function readQuestion() {
    const res = await jsonFetch(
        "/api2/questions/" + id,
    )
    if (res.status == 200) {
        question.value = await res.json()
    } else {
        error.putResponse(res, 'Failed to fetch question: ')
        router.push("/")
    }
    loading.value = false
}

async function readAnswers() {
    if (!question.value)
        return
    const answerRes = await jsonFetch(
        "/api2/questions/" + id + "/answers",
    )
    if (answerRes.status == 200) {
        answers.value = await answerRes.json()
    } else if (answerRes.status == 403) {
        error.putResponse(answerRes)
        router.push("/")
    } else {
        error.putResponse(answerRes, 'Failed to fetch answers: ')
    }
}

async function createAnswer() {
    answerLoading.value = true
    const answerRes = await jsonFetch("/api2/questions/" + id + "/answers", {
        method: "POST",
        body: JSON.stringify({
            answer: answer.value,
        }),
    })
    if (answerRes.status == 200) {
        readAnswers()
        answer.value = ""
    } else {
        error.putResponse(answerRes, 'Failed to create answer: ')
    }
    answerLoading.value = false
}

async function openQuestion() {
    dialogLoading.value = true
    const answerRes = await jsonFetch("/api2/questions/" + id + "/open", {
        method: "POST",
    })
    if (answerRes.status == 200) {
        readQuestion()
        .then(() => readAnswers().then(() => scrollAnswers()))
    } else {
        error.putResponse(answerRes, 'Failed to open question access: ')
    }
    dialogLoading.value = false
}

async function closeQuestion() {
    dialogLoading.value = true
    const answerRes = await jsonFetch("/api2/questions/" + id + "/close", {
        method: "POST",
    })
    if (answerRes.status == 200) {
        readQuestion()
        .then(() => readAnswers().then(() => scrollAnswers()))
    } else {
        error.putResponse(answerRes, 'Failed to close question access: ')
    }
    dialogLoading.value = false
}

async function deleteQuestion() {
    dialogLoading.value = true
    const answerRes = await jsonFetch("/api2/questions/" + id, {
        method: "DELETE",
    })
    if (answerRes.status == 200) {
        router.push("/questions")
    } else {
        error.putResponse(answerRes, 'Failed to delete question: ')
    }
    dialogLoading.value = false
}

function exportAnswers() {
    if (!isHostAuthed.value)
        return
    const fileName = "question" + question.value?.id! + "answers.csv"
    const lines = ["email,name,answer"]
    for (const answer of answers.value) {
        lines.push(`${answer.answererEmail},${answer.answererName},${answer.answer}`)
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

function answerIsSelf(a: Answer) {
    return a.answererEmail == user.value?.email
}

function scrollAnswers() {
    setTimeout(() => {
        const answersDiv = document.getElementById('answers') as Element
        answersDiv.scrollTop = answersDiv.scrollHeight
    }, 100)
}

function formatAnswer(a: string) {
    if (question.value?.variant == 'single')
        return letters[parseInt(a)]
    if (question.value?.variant == 'multi')
        return a.split(",").map((i) => letters[parseInt(i)]).join(", ")
    return a
}

watch(() => answers.value.length, () => !(question.value?.choices.length) ? scrollAnswers(): null)
watch(() => answer.value.length, () => scrollAnswers())
watch(() => editQuestionPanel.value, () => scrollAnswers())
</script>