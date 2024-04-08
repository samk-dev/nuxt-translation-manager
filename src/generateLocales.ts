import fs from 'node:fs'
import csv from 'csv-parser'
import logger from './logger'

interface ColumnData {
  [key: string]: string
}

function generateLocales(
  csvFilePath: string,
  outputDir: string,
  separator: string
): Promise<void> {
  logger.info('Generating translations...')

  const columns: { [key: string]: ColumnData } = {}

  const processRow = (row: any): void => {
    const key = row.Key.trim()
    Object.keys(row).forEach((header) => {
      if (header !== 'Key') {
        if (!columns[header]) {
          columns[header] = {}
        }
        columns[header][key] = row[header].trim()
      }
    })
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator, skipComments: true }))
      .on('data', (row) => processRow(row))
      .on('end', () => {
        // Sort the keys alphabetically
        Object.keys(columns).forEach((header) => {
          columns[header] = Object.fromEntries(
            Object.entries(columns[header]).sort(([a], [b]) =>
              a.localeCompare(b)
            )
          )
        })

        // Generate a JSON file for each column
        Object.keys(columns).forEach((header) => {
          const outputJson = `${outputDir}/${header}.json`
          fs.writeFileSync(
            outputJson,
            JSON.stringify(columns[header], null, 2),
            'utf-8'
          )
        })

        logger.success('Translations generated successfully')
        resolve()
      })
      .on('error', (error) => reject(error))
  })
}
export default generateLocales