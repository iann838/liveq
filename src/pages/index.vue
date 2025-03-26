<template>
    <v-container class="fill-height">
        <v-responsive
            class="align-centerfill-height mx-auto d-flex-column d-lg-flex"
            max-width="900"
        >

            <v-row style="max-width: calc(100vw - 30px);" no-gutters>
                <v-col
                    cols="12" md="6" class="pt-md-10"
                    style="background-image: radial-gradient(circle at center, rgba(96, 125, 160, 0.35) 0%, rgba(96, 125, 139, 0) 55%);">
                    <v-icon
                        size="150"
                        color="amber"
                        class="mb-6 mx-auto d-block"
                    >mdi-lightbulb</v-icon>
        
                    <div class="text-center">
                        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
                        <h1 class="text-h3 font-weight-bold">LiveQ</h1>
                    </div>
                </v-col>

                <v-col cols="12" md="6" class="mt-16 mt-md-0">
                    <v-card
                        v-if="!user"
                        class="pa-4 pa-md-5"
                        color="blue-grey-darken-4"
                        rounded="lg"
                    >
                        <template #title>
                            <h2 class="font-weight-light">
                                Sign in
                            </h2>
                        </template>

                        <v-card-text>
                            <div class="mb-5">
                                Securely with Google to get started.
                            </div>
                            <google-login
                                v-if="!state.authToken"
                                :callback="login"
                                style="overflow: hidden; border-radius: 8px;"
                            ></google-login>
                            <div class="mt-5">
                                Connect with your instructors and classmates in real-time to ask questions, share answers, and stay engaged.
                            </div>
                            <div class="mt-3 text-grey">
                                How LiveQ uses your information
                                <span>
                                    <v-icon size="16">
                                        mdi-help-circle-outline
                                    </v-icon>
                                    <v-tooltip
                                        activator="parent"
                                        max-width="300"
                                        location="bottom"
                                        open-on-click
                                    >
                                        Your email address and full name will be used for identification and is shared only with your instructors and classmates.
                                    </v-tooltip>
                                </span>
                            </div>
                        </v-card-text>
                    </v-card>

                    <v-card
                        v-else
                        class="pa-4 pa-md-5"
                        color="teal-darken-4"
                        rounded="lg"
                    >
                        <template #title>
                            <div class="d-flex">
                                <h2 class="font-weight-light text-truncate">
                                    Hi, {{ user.displayName.split(" ")[0] }}
                                </h2>
                                <v-btn
                                    class="ml-3 mt-5"
                                    variant="text"
                                    size="small"
                                    density="compact"
                                    @click="logout"
                                >[sign out]</v-btn>
                            </div>
                        </template>

                        <v-card-text>
                            <div class="mb-5">
                                Join a question to contribute your answers.
                                <v-text-field
                                    class="mt-4"
                                    v-model="questionId"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    append-inner-icon="mdi-login-variant"
                                    @click:append-inner="toQuestion"
                                    @keyup.enter="toQuestion"
                                    label="Question ID (12 Characters)"
                                ></v-text-field>
                            </div>
                            <div v-if="user.role == 'host'" class="mt-5">
                                You are signed in as a verified <b>instructor (host)</b>.
                                <v-btn class="mt-3" color="teal-darken-2" to="/questions">Manage questions</v-btn>
                            </div>
                            <div class="mt-5">
                                Connect with your instructors and classmates in real-time to ask questions, share answers, and stay engaged.
                            </div>
                            <div class="mt-3 text-grey">
                                How LiveQ uses your information
                                <span>
                                    <v-icon size="16">
                                        mdi-help-circle-outline
                                    </v-icon>
                                    <v-tooltip
                                        activator="parent"
                                        max-width="300"
                                        location="bottom"
                                        open-on-click
                                    >
                                        Your email address and full name will be used for identification and is shared only with your instructors and classmates.
                                    </v-tooltip>
                                </span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

        </v-responsive>

    </v-container>
</template>

<script lang="ts" setup>
import { state, error, user } from '@/state'
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { CallbackTypes } from 'vue3-google-login'

const router = useRouter()
const questionId = ref("")

const login: CallbackTypes.CredentialCallback = async (res) => {
    const loginRes = await fetch(`/api2/login`, {
        method: "POST",
        headers: { "Google-Authorization": 'Bearer ' + res.credential }
    })
    if (loginRes.status == 200) {
        const { token } = await loginRes.json()
        state.authToken = token
        questionId.value = ""
    } else {
        error.putResponse(loginRes)
    }
}

const logout = () => {
    state.authToken = ""
}

const toQuestion = () => {
    const realQuestionId = questionId.value.replaceAll(" ", "")
    if (realQuestionId.length != 12) {
        error.putSimple("Question ID is 12 characters long")
        return
    }
    router.push(`/questions/${realQuestionId}`)
}

watch(questionId, () => {
    nextTick(() => {
        let original = questionId.value.replaceAll(" ", "").toUpperCase().slice(0, 12)
        let value = original.slice(0, 4)
        if (original.length > 4)
            value += "  " + original.slice(4, 8)
        if (original.length > 8)
            value += "  " + original.slice(8, 12)
        questionId.value = value
    })
})
</script>
