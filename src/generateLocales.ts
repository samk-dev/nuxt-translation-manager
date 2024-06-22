import fs from 'node:fs'
import csv from 'csv-parser'
import logger from './logger'

interface ColumnData {
  [key: string]: string | { description?: string, name?: string }
}

const REGEX_SITE_CONFIG: RegExp = /^NUXT_SITE_CONFIG_(DESCRIPTION|NAME)$/
const SITE_CONFIG_KEY: string = 'nuxtSiteConfig'

function generateLocales(csvFilePath: string, outputDir: string, separator: string): Promise<void> {
  logger.info('Generating translations…')
  const columns: Record<string, ColumnData> = {}
  
  return new Promise((resolve, reject): void => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator, skipComments: true }))

      .on('data', (row: Record<string, string>): void => {
        const key: string = row.Key.trim()

        Object.entries(row).forEach(([column, value]): void => {
          value = (value as string).trim()

          if (column === 'Key' || value.length === 0) return
          if (!columns[column]) columns[column] = {} as ColumnData

          if (!REGEX_SITE_CONFIG.test(key)) {
            columns[column][key] = value
            return
          }

          // Handle special site config keys
          // @see https://nuxtseo.com/site-config/integrations/i18n#usage
          const configKey: string = key.replace('NUXT_SITE_CONFIG_', '').toLowerCase()
          if (!columns[column][SITE_CONFIG_KEY]) columns[column][SITE_CONFIG_KEY] = {} as ColumnData
          (columns[column][SITE_CONFIG_KEY] as ColumnData)[configKey] = value
        })
      })

      .on('end', (): void => {
        // Sort keys alphabetically
        Object.keys(columns).forEach((header: string): void => {
          columns[header] = Object.fromEntries(
            Object.entries(columns[header]).sort(([a], [b]): number =>
              a.localeCompare(b)
            )
          )
        })

        // Generate a JSON file for each column
        Object.keys(columns).forEach((header: string): void => {
          fs.writeFileSync(
            `${outputDir}/${header}.json`,
            JSON.stringify(columns[header], null, 2),
            'utf-8'
          )
        })

        logger.success('Translations generated successfully')
        resolve()
      })

      .on('error', (error: Error): void => reject(error))
  })
}

export default generateLocales