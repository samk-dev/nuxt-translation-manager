import fs from 'node:fs'
import csv from 'csv-parser'
import logger from './logger'

interface LocaleTranslations {
  [key: string]: string | { description?: string, name?: string }
}

const REGEX_SITE_CONFIG: RegExp = /^NUXT_SITE_CONFIG_(DESCRIPTION|NAME)$/
const SITE_CONFIG_KEY: string = 'nuxtSiteConfig'

function generateLocales(
  csvFilePath: string,
  outputDir: string,
  separator: string
): Promise<void> {
  logger.info('Generating translations...')
  const columns: Record<string, LocaleTranslations> = {}
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator, skipComments: true }))
      .on('data', (row: Record<string, string>) => {
        const key: string = row.Key.trim()

        Object.entries(row).forEach(([column, value]) => {
          if (column === 'Key' || !(value as string).trim()) return
          if (!columns[column]) columns[column] = {}

          if (!REGEX_SITE_CONFIG.test(key)) {
            columns[column][key] = value.trim()
            return
          }

          const configKey: string = key.replace('NUXT_SITE_CONFIG_', '').toLowerCase()
          if (!columns[column][SITE_CONFIG_KEY]) columns[column][SITE_CONFIG_KEY] = {}
          columns[column][SITE_CONFIG_KEY][configKey] = value.trim()
        })
      })
      .on('end', () => {
        Object.keys(columns).forEach((header) => {
          const outputPath = `${outputDir}/${header}.json`
          fs.writeFileSync(outputPath, JSON.stringify(columns[header], null, 2), 'utf-8')
        })

        logger.success('Translations generated successfully')
        resolve()
      })
      .on('error', (error) => reject(error))
  })
}

export default generateLocales