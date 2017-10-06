import { promisify } from 'util'
import path from 'path'
import R from 'ramda'

import { readFile } from 'fs'
const readFileAsync = promisify(readFile)
const readFileAsyncAsKeyvalue = filePath =>
  readFileAsync(filePath, { encoding: 'utf8' }).then(val => ({
    [filePath]: val
  }))

const objectValuesAsArray = R.values

const joinTwoPaths = p1 => p2 => path.join('./', p1, p2)
const joinTwoPathsAsRelative = p1 => p2 => path.join('./', p1, '..', p2)

const filterPropertiesWithRef = R.filter(R.has('$ref'))

const getAllRefFilePaths = R.compose(
  R.uniq,
  R.flatten,
  R.map(objectValuesAsArray),
  filterPropertiesWithRef,
  objectValuesAsArray,
  R.prop('properties')
)

export async function resolveJSONSchemaAsync(filePath) {
  const fileContentAsHashMap = R.compose(
    readFileAsyncAsKeyvalue,
    joinTwoPathsAsRelative(filePath)
  )
  const contentsOfFilePaths = R.map(fileContentAsHashMap)

  const fileData = await readFileAsync(filePath, { encoding: 'utf8' })
  const parsedFile = JSON.parse(fileData)
  const properties = R.prop('properties')(parsedFile)

  const refPaths = getAllRefFilePaths(parsedFile)
  const refFileContents = await Promise.all(contentsOfFilePaths(refPaths))
  const refFilesHashMap = refFileContents.reduce(
    (accum, current) =>
      accum.set(
        R.compose(R.head, R.keys)(current),
        R.compose(JSON.parse, R.head, objectValuesAsArray)(current)
      ),
    new Map()
  )

  for (let property in properties) {
    if (R.has('$ref')(properties[property])) {
      const pathKeyForHash = joinTwoPathsAsRelative(filePath)(
        properties[property]['$ref']
      )
      properties[property] = refFilesHashMap.get(pathKeyForHash)
    }
  }

  return { ...parsedFile, properties }
}
