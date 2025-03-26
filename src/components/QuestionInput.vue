<template>
    <v-card elevation="0" :disabled="loading" >
        <v-progress-circular
            v-if="loading"
            class="position-absolute"
            style="top: calc(50% - 50px); left: calc(50% - 50px);"
            :size="100"
            indeterminate
        ></v-progress-circular>
        <v-card-title v-if="updating">Edit Question</v-card-title>
        <v-card-title v-else>Create Question</v-card-title>
        <v-card-text class="pb-0 mt-3">
            <v-text-field
                v-model="form.title"
                label="Title"
                variant="outlined"
                density="compact"
                autofocus
            ></v-text-field>
            <v-textarea
                v-model="form.body"
                label="Body"
                variant="outlined"
                density="compact"
            ></v-textarea>
            <v-select
                v-model="form.variant"
                label="Variant"
                variant="outlined"
                density="compact"
                :items="['open', 'single', 'multi']"
            ></v-select>
            <div
                v-if="form.variant != 'open'"
                variant="outlined"
                class="mt-n3 mb-6 d-flex flex-column"
                density="compact"
                title="Choices"
            >
                <v-btn
                    class="mr-auto mb-3"
                    color="primary"
                    variant="text"
                    size="small"
                    @click="form.choices.push(`Answer Choice ${form.choices.length}`)"
                >+ Add choice</v-btn>
                <v-text-field
                    v-for="(_, i) in form.choices"
                    v-model="form.choices[i]"
                    variant="outlined"
                    density="compact"
                    autofocus
                    hide-details
                >
                    <template v-slot:append-inner>
                        <v-icon
                            color="red"
                            @click="form.choices.splice(i, 1)"
                        >mdi-close</v-icon>
                    </template>
                </v-text-field>
            </div>
            <v-slider
                v-model="form.duration"
                hint="This question will be unavailable after this amount of time"
                :min="60000"
                :max="1800000"
                :step="60000"
                thumb-label="always"
            >
                <template v-slot:prepend>
                    <div class="text-grey-lighten-1 mr-2">
                        <v-icon icon="mdi-clock-minus-outline"></v-icon>
                        <span class="d-none d-sm-inline ml-3">Duration</span>
                    </div>
                </template>
                <template v-slot:thumb-label="{ modelValue }">
                    {{modelValue / 60000}}min
                </template>
            </v-slider>
        </v-card-text>
        <v-card-actions>
            <v-btn color="error" class="ml-auto" @click="emit('cancel')">Cancel</v-btn>
            <v-btn
                v-if="updating"
                :loading="loading"
                color="primary"
                class="mr-3"
                @click="updateQuestion()"
            >
                Update
            </v-btn>
            <v-btn
                v-else
                :loading="loading"
                color="primary"
                class="mr-3"
                @click="createQuestion()"
            >
                Create
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts" setup>
import type { Question } from '@/dtypes'
import { error } from '@/state'
import { jsonFetch } from '@/utils'
import { reactive, ref } from 'vue'

const emit = defineEmits(['cancel', 'success'])
const { updating } = defineProps<{
    updating: Question | undefined
}>()

const loading = ref(false)
const form = reactive({
    title: updating?.title || "",
    body: updating?.body || "",
    choices: updating?.choices || ["Answer Choice 0", "Answer Choice 1"] as Question['choices'],
    variant: updating?.variant || "open",
    duration: updating?.duration || 300000,
})

async function createQuestion() {
    loading.value = true
    if (form.variant == 'open')
        form.choices = []
    const createRes = await jsonFetch("/api2/questions", {
        method: "POST",
        body: JSON.stringify(form),
    })
    if (createRes.status == 200) {
        const question = await createRes.json() as Question
        emit("success", question)
    } else {
        error.putResponse(createRes, 'Failed to create question: ')
    }
    loading.value = false
}

async function updateQuestion() {
    if (!updating)
        return
    loading.value = true
    if (form.variant == 'open')
        form.choices = []
    const updateRes = await jsonFetch(`/api2/questions/${updating.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
    })
    if (updateRes.status == 200) {
        const question = await updateRes.json() as Question
        emit("success", question)
    } else {
        error.putResponse(updateRes, 'Failed to edit question: ')
    }
    loading.value = false
}
</script>
