import path from 'path'
import fs from 'fs'
import iconv from 'iconv-lite'
import csv from 'csvtojson'
const XlsxPopulate = require('xlsx-populate')
import { getLogger } from './logger'

const logger = getLogger('main')

/**
 * 指定したパスのcsvファイルをロードして、JSONオブジェクトとしてparseする。
 * 全行読み込んだら完了する Promise を返す。
 * @param filePath
 */
export const csv2json = (filePath: string): Promise<Array<any>> => {
  return new Promise((resolve, reject) => {
    const datas: any[] = []

    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('Shift_JIS'))
      .pipe(iconv.encodeStream('utf-8'))
      .pipe(csv().on('data', (data) => datas.push(JSON.parse(data))))
      .on('end', () => resolve(datas))
  })
}

/**
 * Excelファイルを読み込み、各行をデータとして配列で返すメソッド。
 * @param path Excelファイルパス
 * @param sheet シート名
 * @param format_func フォーマット関数。instanceは各行データが入ってくるので、任意に整形して返せばよい
 */
export const xlsx2json = async (
  inputFullPath: string,
  sheetName = 'Sheet1',
  format_func?: (instance: any) => any,
): Promise<Array<any>> => {
  const workbook: any = await XlsxPopulate.fromFileAsync(inputFullPath)
  const headings: string[] = getHeaders(workbook, sheetName)
  // console.log(headings.length)
  const valuesArray: any[][] = getValuesArray(workbook, sheetName)

  const instances = valuesArray.map((values: any[]) => {
    return values.reduce((box: any, column: any, index: number) => {
      // 列単位で処理してきて、ヘッダの名前で代入する。
      box[headings[index]] = column
      return box
    }, {})
  })

  if (format_func) {
    return instances.map((instance) => format_func(instance))
  }
  return instances
}

/**
 * 引数のJSON配列を、指定したテンプレートを用いて、指定したファイルに出力します。
 * @param instances JSON配列
 * @param outputFullPath 出力Excelのパス
 * @param templateFullPath 元にするテンプレートExcelのパス
 * @param sheetName テンプレートExcelのシート名
 * @param applyStyles 出力時のExcelを書式フォーマットしたい場合に使用する。
 */
export const json2xlsx = async (
  instances: Array<any>,
  outputFullPath: string,
  templateFullPath: string = '',
  sheetName: string = 'Sheet1',
  applyStyles?: (instances: Array<any>, workbook: any, sheetName: string) => void,
): Promise<string> => {
  logger.debug(`template path: ${templateFullPath}`)
  // console.log(instances[0])
  // console.table(instances)

  let headings: Array<string> = []
  let workbook: any
  if (templateFullPath !== '') {
    // 指定された場合は、一行目の文字列群を使ってプロパティを作成する
    workbook = await XlsxPopulate.fromFileAsync(templateFullPath)
    headings = getHeaders(workbook, sheetName)
  } else {
    // templateが指定されない場合は、空ファイルをつくり、オブジェクトのプロパティでダンプする。
    workbook = await XlsxPopulate.fromBlankAsync()
    if (instances.length > 0) {
      headings = Object.keys(instances[0])
    }
  }

  if (instances.length > 0) {
    const csvArrays: any[][] = createCsvArrays(headings, instances)
    // console.table(csvArrays)
    const rowCount = instances.length
    const columnCount = headings.length
    const sheet = workbook.sheet(sheetName)

    if (sheet.usedRange()) {
      sheet.usedRange().clear() // Excel上のデータを削除して。
    }
    sheet.cell('A1').value(csvArrays)

    // データがあるところには罫線を引く(細いヤツ)
    const startCell = sheet.cell('A1')
    const endCell = startCell.relativeCell(rowCount, columnCount - 1)

    sheet.range(startCell, endCell).style('border', {
      top: { style: 'hair' },
      left: { style: 'hair' },
      bottom: { style: 'hair' },
      right: { style: 'hair' },
    })

    if (applyStyles) {
      applyStyles(instances, workbook, sheetName)
      // よくある整形パタン。
      // sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
      // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
      // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻
    }
  }

  logger.debug(outputFullPath)
  await workbook.toFileAsync(outputFullPath)

  return toFullPath(outputFullPath)
}

/**
 * Excelのシリアル値を、Dateへ変換します。
 * @param serialNumber シリアル値
 */
export const dateFromSn = (serialNumber: number): Date => {
  return XlsxPopulate.numberToDate(serialNumber)
}

export const toBoolean = function (boolStr: string | boolean): boolean {
  if (typeof boolStr === 'boolean') {
    return boolStr
  }
  return boolStr.toLowerCase() === 'true'
}

const getHeaders = (workbook: any, sheetName: string): Array<string> => {
  return workbook.sheet(sheetName).usedRange().value().shift()
}

const getValuesArray = (workbook: any, sheetName: string): any[][] => {
  const valuesArray: any[][] = workbook.sheet(sheetName).usedRange().value()
  valuesArray.shift() // 先頭除去
  return valuesArray
}

const toFullPath = (str: string): string => {
  let ret = ''
  if (path.isAbsolute(str)) {
    ret = str
  } else {
    ret = path.join(path.resolve(''), str)
  }
  return ret
}

// 自前実装
function createCsvArrays(headings: string[], instances: any[]) {
  const csvArrays: any[][] = instances.map((instance: any): any[] => {
    // console.log(instance)
    const csvArray = headings.reduce((box: any[], header: string): any[] => {
      // console.log(`${instance[header]}: ${instance[header] instanceof Object}`)
      if (instance[header] instanceof Object) {
        box.push(JSON.stringify(instance[header]))
      } else {
        box.push(instance[header])
      }
      return box
    }, [])
    return csvArray
  })
  csvArrays.unshift(headings)
  return csvArrays
}