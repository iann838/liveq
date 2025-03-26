import { state } from "./state";

export function hashColor(value: string, saturation = 30, lightness = 20) {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash)
        hash = hash & hash
    }
    return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`
}

export function generateRandomString(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const jsonFetch: typeof fetch = async (input, init) => {
    return await fetch(input, {
        ...init,
        headers: {
            ...init?.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authToken}`
        }
    })
}

export function copyToClipboard(a: string) {
    navigator.clipboard.writeText(a)
}