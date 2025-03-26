
export interface QuestionInput {
    title: string
    body: string
    variant: "open" | "single" | "multi"
    choices: string[]
    duration: number
}

export interface Question extends QuestionInput {
    id: string
    expiresAt: number
    updatedAt: number
    answerCount: number
    hostEmail?: string
}

export interface Answer {
    id: number
    answererEmail: string 
    answererName: string
    answer: string
    createdAt: number
}
