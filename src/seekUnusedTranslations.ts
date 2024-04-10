import { resolve } from 'node:path'
import csv from 'csv-parser'
import fs from 'node:fs'
import logger from './logger'
import readline from 'node:readline'

export interface SeekOptions {
  lintDirs: string[],
  separator: string
}

const REGEX_FILE_EXTENSIONS: RegExp = /\.(json|ts|vue|yml)$/i
const SEGMENT_MIN_LENGTH: number = 2
const SEGMENT_MATCH_THRESHOLD: number = 0.5

async function seekUnusedTranslations(csvFilePath: string, srcDir: string, { lintDirs, separator }: SeekOptions): Promise<void> {
  if (lintDirs.length < 1) {
    logger.info('No directories specified for linting.')
    return
  }

  logger.info('Seeking unused translations…')
  const allKeys: Set<string> = new Set()

  await new Promise<void>((resolve, reject): void => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator }))
      .on('data', (data) => allKeys.add(data.Key))
      .on('end', resolve)
      .on('error', reject)
  })

  const foundKeys: Set<string> = new Set()
  const maybeKeys: Set<string> = new Set()
  const validKeys: Set<string> = new Set(Array.from(allKeys).filter(key => key.split('_').length >= SEGMENT_MIN_LENGTH))

  const searchKeysInFile = async (path: string): Promise<void> => {
    const stream: fs.ReadStream = fs.createReadStream(path)
    const reader: readline.Interface = readline.createInterface({ crlfDelay: Infinity, input: stream })

    for await (const line of reader) {
      for (const key of validKeys) {
        if (foundKeys.has(key)) continue

        if (line.includes(key)) {
          logger.debug(`FOUND ${ key }`)
          foundKeys.add(key)
          maybeKeys.delete(key)
          continue
        }
        
        if (maybeKeys.has(key)) continue
        const segments: string[] = key.split('_')
        const matches: number = segments.filter((s: string) => line.includes(s)).length

        if (matches / segments.length >= SEGMENT_MATCH_THRESHOLD) {
          maybeKeys.add(key)
          logger.debug(`MAYBE ${ key }: score ${ (matches / segments.length) * 100 }%, file: ${ path }`)
        }
      }
    }
  }

  for (const dir of lintDirs) {
    const root: string = resolve(srcDir, dir as string)
    const files: string[] = await fs.promises.readdir(root)

    for (const file of files) {
      if (!REGEX_FILE_EXTENSIONS.test(file as string)) continue
      await searchKeysInFile(resolve(root, file as string))
    }
  }

  const notUsed: Set<string> = new Set(Array.from(validKeys).filter((key: string) => !foundKeys.has(key) && !maybeKeys.has(key)))
  const print: Function = notUsed.size ? logger.warn : logger.info
  const skipped: number = allKeys.size - validKeys.size
  let status: string = notUsed.size ? `Detected ${ notUsed.size } unused translations` : 'No unused translations detected'

  if (skipped > 0) status += ` (${ skipped } skipped)`
  if (notUsed.size > 0) status = `${ status }: ${ Array.from(notUsed).join(', ') }`
  print(status)
}

export default seekUnusedTranslations
