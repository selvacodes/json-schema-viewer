'use strict';

var _handledir = require('./handledir');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const jsonParser = require('json-schema-ref-parser');

// processDirectory('./schema/productAPI').then(filesGenerated => {
//   console.log(`No of files processed : ${filesGenerated.length}`)
//   filesGenerated.map((val, index) => {
//     const fileName = path.parse(val).base
//     console.log(`${index + 1}. ${fileName}`)
//   })
// })

// jsonParser.dereference('./schema/productAPI/login_request.json') .then(function(schema) {
//   console.log(schema)
// });