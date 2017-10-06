'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.resolveJSONSchemaAsync = resolveJSONSchemaAsync;

var _util = require('util');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFileAsync = (0, _util.promisify)(_fs.readFile);
const readFileAsyncAsKeyvalue = filePath => readFileAsync(filePath, { encoding: 'utf8' }).then(val => ({
  [filePath]: val
}));

const objectValuesAsArray = _ramda2.default.values;

const joinTwoPaths = p1 => p2 => _path2.default.join('./', p1, p2);

const filterPropertiesWithRef = _ramda2.default.filter(_ramda2.default.has('$ref'));

const getAllRefFilePaths = _ramda2.default.compose(_ramda2.default.uniq, _ramda2.default.flatten, _ramda2.default.map(objectValuesAsArray), filterPropertiesWithRef, objectValuesAsArray, _ramda2.default.prop('properties'));

async function resolveJSONSchemaAsync(filePath) {
  const fileContentAsHashMap = _ramda2.default.compose(readFileAsyncAsKeyvalue, joinTwoPaths(filePath));
  const contentsOfFilePaths = _ramda2.default.map(fileContentAsHashMap);

  const fileData = await readFileAsync(filePath, { encoding: 'utf8' });
  const parsedFile = JSON.parse(fileData);
  const properties = _ramda2.default.prop('properties')(parsedFile);

  const refPaths = getAllRefFilePaths(parsedFile);
  const refFileContents = await Promise.all(contentsOfFilePaths(refPaths));
  const refFilesHashMap = refFileContents.reduce((accum, current) => accum.set(_ramda2.default.compose(_ramda2.default.head, _ramda2.default.keys)(current), _ramda2.default.compose(JSON.parse, _ramda2.default.head, objectValuesAsArray)(current)), new Map());

  for (let property in properties) {
    if (_ramda2.default.has('$ref')(properties[property])) {
      const pathKeyForHash = joinTwoPaths(filePath)(properties[property]['$ref']);
      properties[property] = refFilesHashMap.get(pathKeyForHash);
    }
  }

  return _extends({}, parsedFile, { properties });
}