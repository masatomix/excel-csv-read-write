import * as fs from 'fs'
import * as path from 'path'
import { getAndExtract } from '../src/utils'
import { csv2json, json2excel, excel2json, excelStream2json, excel2json2, csv2json2 } from '../src/commonUtils'
import { assertBasicArray } from './utils'
import { Converters, isCSVData } from '../src/data'
import * as XlsxPopulate from 'xlsx-populate'


describe('テスト', () => {
  jest.setTimeout(30000);

  const url = 'http://jusyo.jp/downloads/new/csv/csv_13tokyo.zip'
  let csvPath = ''
  const baseDir: string = path.resolve('')
  let fullPath = ''
  const tmpDir = Date.now().toString()
  const excelPath = path.join(tmpDir, 'excel出力' + '.xlsx')
  const excelPath2 = path.join(tmpDir, '13tokyoResult.xlsx')
  const excelPath3 = path.join(tmpDir, 'resultExcel3.xlsx')
  const excelPath4 = path.join(tmpDir, 'resultExcel4.xlsx')


  beforeEach(async () => {

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    csvPath = await getAndExtract(url)
    fullPath = path.join(baseDir, csvPath)
    await createExcel(fullPath, excelPath)

    console.log(`baseDir: ${baseDir}`)
    console.log(`csvPath: ${csvPath}`)
    console.log(`fullPath: ${fullPath}`)
    console.log(`excelPath: ${excelPath}`)
    console.log(`excelPath2: ${excelPath2}`)
    console.log(`excelPath3: ${excelPath3}`)
    console.log(`excelPath4: ${excelPath4}`)
  })


  it('excel', async () => {
    const results = (await excel2json(excelPath))
      .filter((address) =>
        isCSVData(address) ?
          address.住所CD ? address.住所CD === 100841000 : false
          : false
      )
    // console.table(results)
    assertBasicArray(results, 22)

    for (const result of results) {
      // console.log(JSON.stringify(result))
      console.log(result)
    }
  })


  it('excel2', async () => {
    const results: unknown[] = await excel2json('13tokyo.csv.xlsx')
    console.table(results)
    const filePath1 = await json2excel(results, excelPath2)
    console.log(filePath1)

    const stream = fs.createReadStream('13tokyo.csv.xlsx')
    const results2 = await excelStream2json(stream)
    console.table(results2)
    const filePath2 = await json2excel(results, excelPath2)
    console.log(filePath2)
  })



  it('excel3', async () => {

    const instances = await csv2json(fullPath)
    // プロパティごとに、変換メソッドをかませたケース
    // nowとIdというプロパティには、変換methodを指定
    const converters: Converters = {
      住所CD: (value: string) => 'PREFIX:' + value,
      郵便番号: (value: string) => '〒:' + value,
    }
    await json2excel(instances, excelPath3, '', 'Sheet1', converters)
  })

  it('excel4', async () => {

    const instances = (await csv2json(fullPath)).map(instance => Object.assign({}, instance, { now: new Date() }))
    // プロパティごとに、変換メソッドをかませたケース
    // nowとIdというプロパティには、変換methodを指定
    const converters: Converters = {
      住所CD: (value: string) => 'PREFIX:' + value,
      郵便番号: (value: string) => '〒:' + value,
    }

    const excelFormatter = (instances: any[], workbook: XlsxPopulate.Workbook, sheetName: string) => {
      const rowCount = instances.length
      const sheet = workbook.sheet(sheetName)
      sheet.range(`M2:M${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻
      // よくある整形パタン。
      sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
      // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
      // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻
    }
    await json2excel(instances, excelPath4, '', 'Sheet1', converters, excelFormatter)
  })

  it('excel5', async () => {
    const results: unknown[] = await excel2json2({ filePath: excelPath, option: { startIndex: 3 } })
    console.table(results.filter((result, index) => index < 10))


    const results2: unknown[] = await csv2json2({ filePath: csvPath })
    console.table(results2.filter((result2, index) => index == 10))

  })



  // it('excel入力', async () => {
  //   await createExcel(fullPath,excelPath)

  //   const results = await excel2json('13tokyo.csv.xlsx')
  //   console.table(results)
  //   const filepath = await json2excel(results, path.join('output', '13tokyoResult.xlsx'))
  //   console.log(filepath)
  // })

  afterEach(() => {
    // !fs.existsSync(fullPath) || fs.unlinkSync(fullPath)
    // !fs.existsSync(excelPath) || fs.unlinkSync(excelPath)
    // !fs.existsSync(excelPath2) || fs.unlinkSync(excelPath2)
    // !fs.existsSync(excelPath3) || fs.unlinkSync(excelPath3)
    // !fs.existsSync(excelPath4) || fs.unlinkSync(excelPath4)
    // !fs.existsSync(tmpDir) || fs.rmdirSync(tmpDir)
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir, { recursive: true })

  })

  /**
  * ネットからZIP化されたファイルをダウンロードして解凍(これは beforeEach で実施)
  * 取り出したCSVを読んでJSONにし、ふたたびExcelに書き出すサンプル
  * CSVデータは全部文字列で取得できる。
  * 
 ┌─────────┬─────────────┬────────┬─────────┬─────────────┬────────────┬────────┬───────┬───────┬──────────┬────────┬────────┬────────┬────────────┬──────────┬───────┬───────┬──────────┬────┬──────┬────────┬───────┬───────┐
 │ (index) │    住所CD     │ 都道府県CD │ 市区町村CD  │    町域CD     │    郵便番号    │ 事業所フラグ │ 廃止フラグ │ 都道府県  │  都道府県カナ  │  市区町村  │ 市区町村カナ │   町域   │    町域カナ    │   町域補足   │ 京都通り名 │  字丁目  │  字丁目カナ   │ 補足 │ 事業所名 │ 事業所名カナ │ 事業所住
 所 │ 新住所CD │
 ├─────────┼─────────────┼────────┼─────────┼─────────────┼────────────┼────────┼───────┼───────┼──────────┼────────┼────────┼────────┼────────────┼──────────┼───────┼───────┼──────────┼────┼──────┼────────┼───────┼───────┤
 │    0    │ '100000000' │  '13'  │ '13101' │ '131010000' │ '100-0000' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │   ''   │    '　'     │ '（該当なし）' │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 │    1    │ '100000400' │  '13'  │ '13101' │ '131010006' │ '100-0004' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '大手町'  │  'オオテマチ'   │    ''    │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 │    2    │ '100000200' │  '13'  │ '13101' │ '131010039' │ '100-0002' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '皇居外苑' │ 'コウキョガイエン' │    ''    │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 │    3    │ '100000100' │  '13'  │ '13101' │ '131010045' │ '100-0001' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '千代田'  │   'チヨダ'    │    ''    │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 │    4    │ '100000300' │  '13'  │ '13101' │ '131010051' │ '100-0003' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '一ツ橋'  │  'ヒトツバシ'   │    ''    │  ''   │ '１丁目' │ '０１チョウメ' │ '' │  ''  │   ''   │  ''   │  ''   │
 │    5    │ '100000500' │  '13'  │ '13101' │ '131010055' │ '100-0005' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '丸の内'  │  'マルノウチ'   │    ''    │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 │    6    │ '100000600' │  '13'  │ '13101' │ '131010057' │ '100-0006' │  '0'   │  '0'  │ '東京都' │ 'トウキョウト' │ '千代田区' │ 'チヨダク' │ '有楽町'  │ 'ユウラクチョウ'  │    ''    │  ''   │  ''   │    ''    │ '' │  ''  │   ''   │  ''   │  ''   │
 └─────────┴─────────────┴────────┴─────────┴─────────────┴────────────┴────────┴───────┴───────┴──────────┴────────┴────────┴────────┴────────────┴──────────┴───────┴───────┴──────────┴────┴──────┴────────┴───────┴───────┘
  * 
  */
  const createExcel = async (csvPath: string, excelPath: string): Promise<void> => {
    const instances = await csv2json(csvPath)
    await json2excel(instances, excelPath)
    expect(fs.existsSync(excelPath)).toBeTruthy()
  }


})

