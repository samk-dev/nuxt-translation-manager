# Nuxt Translation Manager

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

[![temp-Image4v-TX6-F.jpg](https://i.postimg.cc/jqn4w5y1/temp-Image4v-TX6-F.jpg)](https://postimg.cc/3W7vz3Sj)

Simple and easy to use translation manager for `nuxt` and `nuxt-i18n` that allows to manage translations from a single CSV file.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://codesandbox.io/p/github/samk-dev/nuxt-translation-manager-module-usage-example/main)
- [🐱 Playground repository](https://github.com/samk-dev/nuxt-translation-manager-module-usage-example)

## Features

- Manage translations from a single CSV file
- Hot module reload whenever the csv file is updated

## Quick Setup

1. Add `nuxt-translation-manager` dependency to your project

```bash
npx nuxi@latest module add translation-manager
```

## Manual Installation

1. Add `nuxt-translation-manager` dependency to your project

```bash
npm install -D nuxt-translation-manager

pnpm install -D nuxt-translation-manager

yarn add -D nuxt-translation-manager
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

This will generate a CSV file that looks like this:

| Key     | en-US          | fr         | de              |
|---------|----------------|------------|-----------------|
| hello   | Hello          | Bonjour    | Hallo           |
| goodbye | Goodbye        | Au revoir  | Auf Wiedersehen |
| thanks  | Thanks         | Merci      | Danke           |

**Be sure to use the format** `lang-code` in the header row e.g. `es-ES`

**Be sure to set the delimiter to comma in your csv editor** `,`

**You can use comments in your csv file** using `#`

✨ Tip: you can use [Edit CSV Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=janisdd.vscode-edit-csv) to manage your csv file inside of `vscode`

<details>
  <summary>View raw csv code</summary>

  ```csv
  Key,"English, en-US","French, fr","German, de"
  hello,"Hello","Bonjour","Hallo"
  goodbye,"Goodbye","Au revoir","Auf Wiedersehen"
  thanks,"Thanks","Merci","Danke"
  # COMMENTS TEST
  comment-test,"Comment test","Test comentario","Test comentari"
  ### MULTILINE COMMENT ###
  ### ANOTHER COMMENT ####
  comment-multi,"Comment test","Test comentario","Test comentari"
  ```

</details>

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

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-translation-manager/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-translation-manager

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-translation-manager.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-translation-manager

[license-src]: https://img.shields.io/npm/l/nuxt-translation-manager.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-translation-manager

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
