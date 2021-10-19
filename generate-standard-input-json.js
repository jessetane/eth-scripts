import fs from 'fs/promises'

export default async function generateStandardInputJson (settings, files) {
  const sources = {}
  for (var path in files) {
    sources[path] = {
      content: await fs.readFile(path, 'utf8')
    }
  }
  return { language: 'Solidity', settings, sources }
}
