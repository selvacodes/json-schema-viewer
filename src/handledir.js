import { promisify } from 'util'
import { resolveJSONSchemaAsync } from './resolve'
import { writeFile, readdir } from 'fs'
import path from 'path'

import R from 'ramda'

const writeFileAsync = promisify(writeFile)
const readdirAsync = promisify(readdir)

function resolveAndWriteFiles(filePath) {
  const parsedPath = path.parse(filePath)

  const genFilePath = path.join(parsedPath.dir, `${parsedPath.name}.flat.json`)
  return resolveJSONSchemaAsync(filePath).then(contents => {
    return writeFileAsync(genFilePath, JSON.stringify(contents), 'utf8').then(
      _ => genFilePath
    )
  })
}

const containJSON = R.contains('json')
const notContainFlat = R.compose(R.not, R.contains('flat'))

const fileFilter = val => containJSON(val) && notContainFlat(val)

export async function processDirectory(folderName) {
  const directoryContents = await readdirAsync(folderName)
  const filesToParse = R.filter(fileFilter, directoryContents)
  const pathsOfFiles = R.map(val => path.join(folderName, val))(filesToParse)
  const filesGenerated = await Promise.all(
    R.map(resolveAndWriteFiles)(pathsOfFiles)
  )
  return filesGenerated
}
