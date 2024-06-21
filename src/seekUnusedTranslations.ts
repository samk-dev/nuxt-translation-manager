import { resolve } from 'node:path'
import fs from 'node:fs'
import readline from 'node:readline'

import csv from 'csv-parser'
import micromatch from 'micromatch'

import { REGEX_FILE_EXTENSIONS, REGEX_SITE_CONFIG, SEGMENT_MIN_LENGTH, SEGMENT_MATCH_THRESHOLD } from './constants'
import logger from './logger'

export interface SeekOptions {
  lintGlobs: string[],
  separator: string
}

async function seekUnusedTranslations(csvFilePath: string, cwd: string, { lintGlobs, separator }: SeekOptions): Promise<void> {
  if (lintGlobs.length < 1) {
    logger.info('No paths specified for linting. Skipping check.')
    return
  }

  try {
    await fs.promises.access(csvFilePath, fs.constants.R_OK)
  } catch (error) {
    logger.error(`The csv file at '${csvFilePath}' does not exist or is not readable (${error})`)
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
    const input: fs.ReadStream = fs.createReadStream(path)
    const reader: readline.Interface = readline.createInterface({ crlfDelay: Infinity, input })

    for (const key of validKeys)
      if (REGEX_SITE_CONFIG.test(key)) foundKeys.add(key)

    for await (const line of reader) {
      for (const key of validKeys) {
        if (foundKeys.has(key)) continue
        logger.debug(`Searching ${ path } for ${ key }…`)

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

  try {
    const all: fs.Dirent[] = await fs.promises.readdir(cwd, { recursive: true, withFileTypes: true })
    const files: fs.Dirent[] = all.filter((f: fs.Dirent): boolean => f.isFile() && REGEX_FILE_EXTENSIONS.test(f.name))
    const list: string[] = files.map((f: fs.Dirent): string => resolve(f.path, f.name))
    logger.debug(`Found ${ list.length } files:\n${ list.join('\n') }`)

    const matches: string[] = micromatch(list, lintGlobs.map(g => resolve(cwd, g)), { cwd })
    logger.debug(`Found ${ matches.length } matches:\n${ matches.join('\n') }`)

    for (const file of matches) {
      logger.debug(`Processing ${ file }`)
      await searchKeysInFile(file)
    }
  } catch (error) {
    logger.error(`Seeking unused translations failed: ${error.message}`)
  }

  const notUsed: Set<string> = new Set(Array.from(validKeys).filter((key: string) => !foundKeys.has(key) && !maybeKeys.has(key)))
  const print: Function = notUsed.size ? logger.warn : logger.success
  const skipped: number = allKeys.size - validKeys.size
  let status: string = notUsed.size ? `Detected ${ notUsed.size } unused translations` : 'No unused translations detected'

  if (skipped > 0) status += ` (${ skipped } skipped)`
  if (notUsed.size > 0) status = `${ status }: ${ Array.from(notUsed).join(', ') }`
  print(status)
}

export default seekUnusedTranslations