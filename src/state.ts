import { reactive, ref, watch } from "vue"

let defaultState = {
    authToken: "",
    authTokenExp: new Date().toISOString(),
}
defaultState = {
    ...defaultState,
    ...(JSON.parse(localStorage.getItem("state") || "{}") as typeof defaultState),
}

const state = reactive(defaultState)

interface UserJWTPayload {
    email: string
    displayName: string
    role: "host" | "guest"
    exp: string
}

function decodeJWT(jwt: string): UserJWTPayload | undefined {
    try {
        const [, payloadBase64] = jwt.split(".")
        if (!payloadBase64) {
            throw new Error("Invalid JWT format")
        }
        const payloadJson = atob(
            payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
        )
        return JSON.parse(payloadJson) as UserJWTPayload
    } catch (error) {
        return undefined;
    }
}

const user = ref<UserJWTPayload | undefined>(undefined)

watch(state, (value) => {
    if (value.authToken) {
        user.value = decodeJWT(value.authToken)
        value.authTokenExp = user.value!.exp
    } else {
        user.value = undefined
        value.authTokenExp = new Date().toISOString()
    }
    localStorage.setItem("state", JSON.stringify(value))
}, { immediate: true })
localStorage.setItem("state", JSON.stringify(state))

if (new Date(state.authTokenExp).getTime() - Date.now() < 86400 * 3 * 1000) {
    state.authToken = ""
    state.authTokenExp = new Date().toISOString()
}

const error = reactive({
    message: "",
    items: [] as string[],
    timeoutId: 0,
    async clearAfter(ms=5000) {
        clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {
            this.message = ""
            this.items = []
        }, ms)
    },
    async putSimple(message: string) {
        this.message = message
        this.items = []
        this.clearAfter()
    },
    async putResponse(res: Response, prefix="") {
        if (res.status >= 500)
            this.putSimple(prefix + 'Internal server error')
        else if (res.status == 429)
            this.putSimple(prefix + 'Too many requests')
        else if (res.status == 422) {
            const { detail } = await res.json()
            this.message = prefix + "Bad Request"
            this.items = detail.map((d: any) => d.issues.map((i: any) => i.path + ": " + i.message).join(", "))
        } else {
            const { detail } = await res.json()
            this.putSimple(prefix + detail)
        }
        this.clearAfter()
    },
})

export { state, error, user }
