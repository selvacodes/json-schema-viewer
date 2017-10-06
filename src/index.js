import { processDirectory } from './handledir'
import path from 'path'
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

