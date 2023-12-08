# Nuxt Translation Manager

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Simple and easy to use translation manager for `nuxt` and `nuxt-i18n` that allows to manage translations from a single CSV file.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-translation-manager?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- Manage translations from a single CSV file
- Hot module reload whenever the csv file is updated

## Quick Setup

1. Add `nuxt-translation-manager` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-translation-manager

# Using yarn
yarn add --dev nuxt-translation-manager

# Using npm
npm install --save-dev nuxt-translation-manager
```

2. Add `nuxt-translation-manager` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-translation-manager'
  ]
})
```

That's it! You can now use Nuxt Translation Manager in your Nuxt app ✨

## Usage

Create `translations.csv` file in your `langDir`

```bash
echo 'Key,"en-US","es-ES","ca-ES"
login,"Login","Acceder","Accedir"' > path-to-your-langDir/translations.csv
# replace `path-to-your-langDir`
```

✨ Tip: you can use [Edit CSV Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=janisdd.vscode-edit-csv) to manage your csv file inside of `vscode`

## Options

```ts
// config key
export default defineNuxtConfig({
  'translation-manager': {}
})

interface ModuleOptions {
  /**
   * nuxt-i18n lang dir
   *
   * @default 'locales'
   */
  langDir?: string
  /**
   * csv file name without .csv file extension
   *
   * @default 'translations'
   */
  translationFileName?: string
  /**
   * where to store json files
   *
   * @default 'langDir'
   */
  outputDir?: string
}
```

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
pnpm run release
```

## Credits

Inspired by [Quasalang CLI](https://github.com/dannyconnell/quasalang) by [Danny Connell](https://github.com/dannyconnell)

## TODO

- [] Generate a template for translations.csv file instead of creating it manually
- [] Add a GUI manager to Nuxt Devtools

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-translation-manager/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-translation-manager

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-translation-manager.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-translation-manager

[license-src]: https://img.shields.io/npm/l/nuxt-translation-manager.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-translation-manager

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
