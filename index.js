const { promisify } = require('util')
const path = require('path')
const {
  compose,
  prop,
  values,
  filter,
  has,
  map,
  flatten,
  head,
  keys,
  uniq
} = require('ramda')

const fs = require('fs')
const readFileAsync = promisify(fs.readFile) // (A)

const readFileAsyncWithFileName = fileName =>
  readFileAsync(fileName, { encoding: 'utf8' }).then(val => ({
    [fileName]: val
  }))

const filePath = './sample/1.json'

const joinTwoPaths = p1 => p2 => path.join('./', p1, p2)

const filterWithRef = filter(has('$ref'))

const getRefPath = compose(
  uniq,
  flatten,
  map(values),
  filterWithRef,
  values,
  prop('properties'),
  JSON.parse
)

const fileContentWithName = compose(
  readFileAsyncWithFileName,
  joinTwoPaths(filePath)
)

const mainFile = readFileAsync(filePath, { encoding: 'utf8' })
mainFile
  .then(getRefPath)
  .then(paths => {
    return Promise.all(map(fileContentWithName)(paths))
  })
  .then(arr =>
    arr.reduce((acc, curr) => {
      acc.set(
        compose(head, keys)(curr),
        compose(JSON.parse, head, values)(curr)
      )
      return acc
    }, new Map())
  )
  .then(val => {
    return Promise.all([mainFile, Promise.resolve(val)])
  })
  .then(([fileValue, refValue]) => {
    const parsedFile = JSON.parse(fileValue)
    const props = compose(prop('properties'))(parsedFile)

    for (let x in props) {
      if (has('$ref')(props[x])) {
        props[x] = refValue.get(joinTwoPaths(filePath)(props[x]['$ref']))
      }
    }
    return Object.assign({}, parsedFile, { properties: props })
  })
  .then(console.log)
  .catch(console.error)
