import { relative, resolve as pathResolve } from 'node:path'
import fs from 'node:fs'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { name, version } from '../package.json'
import generateLocales from './generateLocales'
import logger from './logger'
import seekUnusedTranslations from './seekUnusedTranslations'

import type { SeekOptions } from './seekUnusedTranslations'

export interface ModuleOptions {
  /**
   * nuxt-i18n lang dir
   *
   * @default 'locales'
   */
  langDir?: string
  /**
   * where to look for translation keys
   * 
   * @default "[]"
  */
  lintDirs?: string[]
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
  /**
   * csv separator character
   *
   * @default ','
   */
  separator?: string
}

export default defineNuxtModule<ModuleOptions>({
  defaults: {
    langDir: 'locales',
    lintGlobs: [],
    separator: ',',
    translationFileName: 'translations'
  },
  meta: {
    name,
    version,
    configKey: 'translation-manager',
    compatibility: {
      bridge: false,
      nuxt: '^3.0.0'
    }
  },
  setup(options, nuxt): void {
    const { resolve } = createResolver(import.meta.url)

    const csvFilePath: string = `${options.langDir}/${options.translationFileName}.csv`
    const csvFileFullPath: string = resolve(nuxt.options.srcDir, csvFilePath)

    const outputDir: string = options.outputDir
      ? resolve(options.outputDir)
      : resolve(nuxt.options.srcDir, options.langDir as string)

    // dirty work around to not trigger the method when the module is
    // generating it's own types then the method fails.
    const currentDir: string = fs.readdirSync(resolve(nuxt.options.srcDir))
    const isNuxtDir: boolean = currentDir.includes('app.vue')

    const runIf = async (condition: boolean): Promise<void> => {
      if (!condition) return

      try {
        await generateLocales(
          csvFileFullPath,
          outputDir,
          options.separator as string
        )

        await seekUnusedTranslations(
          csvFileFullPath,
          nuxt.options.srcDir,
          options as SeekOptions
        )
      } catch (error) {
        logger.error(error)
      }
    }

    nuxt.hook('builder:watch', (_event, path): void => {
      path = relative(
        nuxt.options.srcDir,
        pathResolve(nuxt.options.srcDir, path)
      )

      runIf(path === csvFilePath)
    })

    runIf(isNuxtDir)
  }
})
