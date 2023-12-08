import { fileURLToPath } from 'node:url'
import fs from 'fs'
import { describe, it, expect } from 'vitest'
import { setup } from '@nuxt/test-utils'

describe('generateLocales function', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url))
  })

  const outputFolder = fileURLToPath(
    new URL('./fixtures/basic/locales', import.meta.url)
  )
  const headers = ['en-US', 'es-ES', 'ca-ES']

  headers.forEach((header) => {
    const outputJson = `${outputFolder}/${header}.json`

    it(`generates locale files correctly for ${header}.json`, () => {
      expect(fs.existsSync(outputJson)).toBe(true)
    })

    it(`generated file for ${header}.json has values`, () => {
      const jsonData = JSON.parse(fs.readFileSync(outputJson, 'utf-8'))

      expect(jsonData).toBeDefined()
      expect(Object.keys(jsonData).length).toBeGreaterThan(0)
    })

    it(`generated file for ${header}.json has correct translation`, () => {
      const jsonData = JSON.parse(fs.readFileSync(outputJson, 'utf-8'))

      if (header === 'en-US') expect(jsonData.tomorrow).toBe('Tomorrow')
      if (header === 'es-ES') expect(jsonData.tomorrow).toBe('Mañana')
      if (header === 'ca-ES') expect(jsonData.tomorrow).toBe('Demà')
    })
  })
})
