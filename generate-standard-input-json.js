import fs from 'fs/promises'

export default async function generateStandardInputJson (settings, mapOfFileNames) {
  const sources = {}
  for (let path in mapOfFileNames) {
    const source = mapOfFileNames[path]
    const firstUrl = source && source.urls && source.urls[0]
    sources[path] = {
      content: await fs.readFile(firstUrl || path, 'utf8')
    }
  }
  return { language: 'Solidity', settings, sources }
}
