import { getAndExtract } from './utils'
import { json2xlsx, csv2json, xlsx2json } from './ParseSamples'
import fs from 'fs'

// const sample1 = () => {
//   getAndExtract('http://jusyo.jp/downloads/new/csv/csv_13tokyo.zip').then(() => {
//     csv2json('./13tokyo.csv')
//       .then((results: any[]) => {
//         // 郵便番号が「100-000x」のものに絞ってみた
//         const fresults = results.filter((address) => address['郵便番号'].startsWith('100-000'))
//         console.table(fresults)
//         for (const address of fresults) {
//           console.log(address)
//         }
//         json2xlsx(fresults, './13tokyo.xlsx')
//       })
//       .finally(() => {
//         if (fs.existsSync('./13tokyo.csv')) {
//           fs.unlinkSync('./13tokyo.csv')
//         } else {
//           console.log('あれ？ない')
//         }
//       })
//   })
// }

function sample2() {
  const resultPromise = xlsx2json('input.xlsx')
  resultPromise.then((results) => {
    console.table(results)
    json2xlsx(results, 'excelResults.xlsx').then((path) => console.log(path))
  })
}

if (!module.parent) {
  // sample1()
  sample2()
}
// https://tsurutoro.com/pseudo_data/