export default defineNuxtConfig({
  modules: ['../src/module'],
  'translation-manager': {
    lintDirs: ['.'],
  },
  devtools: { enabled: true }
})
