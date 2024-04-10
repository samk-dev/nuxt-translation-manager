import { resolve } from 'node:path'
import csv from 'csv-parser'
import fs from 'node:fs'
import logger from './logger'

export interface SeekOptions {
  lintDirs: string[],
  separator: string
}

const REGEX_FILE_EXTENSIONS: RegExp = /\.(json|ts|vue|yml)$/i
const SEGMENT_MIN_LENGTH: number = 3
const SEGMENT_PASS_THRESHOLD: number = 3 / 4

async function seekUnusedTranslations(csvFilePath: string, srcDir: string, { lintDirs, separator }: SeekOptions): Promise<void> {
  if (lintDirs.length < 1) {
    logger.info('No directories specified for linting.')
    return
  }

  logger.info('Seeking unused translations…')
  const allKeys: string[] = []

  await new Promise<void>((resolve, reject): void => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator } as Record<string, string>))
      .on('data', (data) => allKeys.push(data.Key))
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
  })

  const foundKeys: Record<string, number> = {}
  const validKeys: string[] = allKeys.filter(key => key.split('_').length >= SEGMENT_MIN_LENGTH)

  for (const dir of lintDirs) {
    const root: string = resolve(srcDir, dir)
    const files: string[] = await fs.promises.readdir(root)

    for (const file: string of files) {
      if (!REGEX_FILE_EXTENSIONS.test(file)) continue

      const path: string = resolve(root, file)
      const text: string = await fs.promises.readFile(path, 'utf-8')

      validKeys.forEach((key: string) => {
        const segments: string[] = key.split('_')
        const { length }: number = segments.filter(segment => text.includes(segment))
        if (length > segments.length * SEGMENT_PASS_THRESHOLD)) foundKeys[key] = (foundKeys[key] || 0) + 1
      })
    }
  }

  const found: string[] = validKeys.filter(key => !Object.keys(foundKeys).includes(key))
  const print: Function = found.length ? logger.warn : logger.info
  const skipped: number = allKeys.length - validKeys.length

  let status: string = found.length?
    `Found ${ found.length } unused translations` :
    'No unused translations found'

  if (skipped > 0) status += ` (${ skipped } skipped)`
  if (found.length > 0) status = `${ status }: ${ found.join(', ') }`
  print(status)
}

export default seekUnusedTranslations
