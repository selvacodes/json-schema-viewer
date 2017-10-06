'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processDirectory = processDirectory;

var _util = require('util');

var _resolve = require('./resolve');

var _fs = require('fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeFileAsync = (0, _util.promisify)(_fs.writeFile);
const readdirAsync = (0, _util.promisify)(_fs.readdir);

function resolveAndWriteFiles(filePath) {
  const parsedPath = _path2.default.parse(filePath);

  const genFilePath = _path2.default.join(parsedPath.dir, `${parsedPath.name}.flat.json`);
  return (0, _resolve.resolveJSONSchemaAsync)(filePath).then(contents => {
    return writeFileAsync(genFilePath, JSON.stringify(contents), 'utf8').then(_ => genFilePath);
  });
}

const containJSON = _ramda2.default.contains('json');
const notContainFlat = _ramda2.default.compose(_ramda2.default.not, _ramda2.default.contains('flat'));

const fileFilter = val => containJSON(val) && notContainFlat(val);

async function processDirectory(folderName) {
  const directoryContents = await readdirAsync(folderName);
  const filesToParse = _ramda2.default.filter(fileFilter, directoryContents);
  const pathsOfFiles = _ramda2.default.map(val => _path2.default.join(folderName, val))(filesToParse);
  const filesGenerated = await Promise.all(_ramda2.default.map(resolveAndWriteFiles)(pathsOfFiles));
  return filesGenerated;
}