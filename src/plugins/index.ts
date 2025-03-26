/**
* plugins/index.ts
*
* Automatically included in `./src/main.ts`
*/

// Plugins
import vuetify from './vuetify'
import router from '../router'
import vue3GoogleLogin from 'vue3-google-login'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
    app
    .use(vuetify)
    .use(router)
    .use(vue3GoogleLogin, {
        clientId: "170108221690-a00h5hjt2oe2jkdcfm2t3uqcur858n7t"
    })
}
