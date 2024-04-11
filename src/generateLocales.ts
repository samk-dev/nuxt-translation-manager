import fs from 'node:fs'
import csv from 'csv-parser'
import logger from './logger'

interface ColumnData {
  [key: string]: string
}

interface LocaleTranslations {
  [key: string]: string | { description?: string, name?: string }
}

const REGEX_SITE_CONFIG: RegExp = /^NUXT_SITE_CONFIG_(DESCRIPTION|NAME)$/
const SITE_CONFIG_KEY: string = 'nuxtSiteConfig'

function generateLocales(csvFilePath: string, outputDir: string, separator: string): Promise<void> {
  logger.info('Generating translations...')
  const columns: Record<string, LocaleTranslations> = {}
  
  return new Promise((resolve, reject): void => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator, skipComments: true }))
      .on('data', (row: Record<string, string>): void => {
        const key: string = row.Key.trim()

        Object.entries(row).forEach(([column, value]): void => {
          value = (value as string).trim()

          if (column === 'Key' || value.length === 0) return
          if (!columns[column]) columns[column] = {} as LocaleTranslations

          if (!REGEX_SITE_CONFIG.test(key)) {
            columns[column][key] = value
            return
          }

          const configKey: string = key.replace('NUXT_SITE_CONFIG_', '').toLowerCase()
          if (!columns[column][SITE_CONFIG_KEY]) columns[column][SITE_CONFIG_KEY] = {} as ColumnData
          (columns[column][SITE_CONFIG_KEY] as ColumnData)[configKey] = value
        })
      })
      .on('end', (): void => {
        Object.keys(columns).forEach((header: string): void => {
          const outputPath: string = `${outputDir}/${header}.json`
          fs.writeFileSync(outputPath, JSON.stringify(columns[header], null, 2), 'utf-8')
        })

        logger.success('Translations generated successfully')
        resolve()
      })
      .on('error', (error: Error): void => reject(error))
  })
}

export default generateLocales