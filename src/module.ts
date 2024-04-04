import { relative, resolve as pathResolve } from 'node:path'
import fs from 'node:fs'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { name, version } from '../package.json'
import generateLocales from './generateLocales'
import logger from './logger'

export interface ModuleOptions {
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

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'translation-manager',
    compatibility: {
      bridge: false,
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    langDir: 'locales',
    translationFileName: 'translations'
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const csvFilePath = `${options.langDir}/${options.translationFileName}.csv`
    const csvFileFullPath = resolve(nuxt.options.srcDir, csvFilePath)

    const outputDir = options.outputDir
      ? resolve(options.outputDir)
      : resolve(nuxt.options.srcDir, options.langDir as string)

    // dirty work around to not trigger the method when the module is
    // generating it's own types then the method fails.
    const currentDir = fs.readdirSync(resolve(nuxt.options.srcDir))
    const isNuxtDir = currentDir.includes('app.vue')

    if (isNuxtDir) {
      try {
        await generateLocales(csvFileFullPath, outputDir)
      } catch (error) {
        logger.error(error)
      }
    }

    nuxt.hook('builder:watch', async (_event, path) => {
      path = relative(
        nuxt.options.srcDir,
        pathResolve(nuxt.options.srcDir, path)
      )
      if (path === csvFilePath) {
        try {
          await generateLocales(csvFileFullPath, outputDir)
        } catch (error) {
          logger.error(error)
        }
      }
    })
  }
})
