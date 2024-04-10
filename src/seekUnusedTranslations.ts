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

function segmentPattern (segment: string, index: number, array: string[]): string {
  segment = segment.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  return `${ index < array.length - 1 ? `\\b${ segment }\\b_` : `\\b${ segment }\\b` }`
}

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

  const foundKeys: Set<string> = new Set<string>()
  const validKeys: string[] = allKeys.filter(key => key.split('_').length >= SEGMENT_MIN_LENGTH)
  
  for (const dir of lintDirs) {
    const root: string = resolve(srcDir, dir as string)
    const files: string[] = await fs.promises.readdir(root)

    for (const file of files) {
      if (!REGEX_FILE_EXTENSIONS.test(file as string)) continue

      const path: string = resolve(root, file as string)
      const text: string = await fs.promises.readFile(path, 'utf-8')

      validKeys.forEach((key: string) => {
        const segments: string[] = key.split('_').map(segmentPattern)
        const regex: RegExp = new RegExp(segments.join(''), 'i')
        if (regex.test(text)) foundKeys.add(key)
      })
    }
  }

  const notUsed: string[] = validKeys.filter((key: string) => !foundKeys.has(key))
  const print: Function = notUsed.length ? logger.warn : logger.info
  const skipped: number = allKeys.length - validKeys.length

  let status: string = notUsed.length?
    `Found ${ notUsed.length } unused translations` :
    'No unused translations found'

  if (skipped > 0) status += ` (${ skipped } skipped)`
  if (notUsed.length > 0) status = `${ status }: ${ notUsed.join(', ') }`
  print(status)
}

export default seekUnusedTranslations
