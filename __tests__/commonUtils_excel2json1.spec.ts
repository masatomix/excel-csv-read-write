
import { data2json, } from '../src/commonUtils'

describe('テスト', () => {
  jest.setTimeout(30000)


  beforeEach(async () => {

  })
  it('excel6', async () => {

    const datas = [
      ['住所CD', '都道府県CD', 'key3', 'key4', 'key5'],
      ['1', '13', 'value1_3', 'value1_4', 'value1_5'],
      ['2', '13', 'value2_3', 'value2_4', 'value2_5'],
      ['3', '13', 'value3_3', 'value3_4', 'value3_5'],
      ['4', '13', 'value4_3', 'value4_4', 'value4_5'],
    ]
    console.log('1.ヘッダが住所CDになっている')
    console.table(data2json(datas, undefined))

    console.log('2.ヘッダが1,13になっている')
    console.table(
      data2json(datas, undefined, {
        startIndex: 1,
      }),
    )

    console.log('3. 2とおなじはず')
    console.table(
      data2json(datas, undefined, {
        startIndex: 1,
        useHeader: true,
      }),
    )
    console.log('4. データが1,13から始まり、ヘッダは0,1,')
    console.table(
      data2json(datas, undefined, {
        startIndex: 1,
        useHeader: false,
      }),
    )
    console.log('5. 4とおなじ')
    console.table(
      data2json(datas, undefined, {
        startIndex: 1,
      }),
    )

    console.log('とにかく1行目から取り込み、ヘッダは0,1')
    console.table(
      data2json(datas, undefined, {
        useHeader: false,
      }),
    )

    console.log('useHeaderがfalseの時は列番号(0始まり)のstart/endを指定して抽出できる')
    console.table(
      data2json(datas, undefined, {
        useHeader: false,
        columnStartIndex: 2,
        columnEndIndex: 4
      }))


  })


  it('excel6', async () => {
    // const workbook = await createWorkbook('13tokyo.csv.xlsx')
    // const valuesArray = getValuesArray(workbook, 'Sheet1')
    // {
    //   const results = data2json(valuesArray, undefined, {
    //     startIndex: 4,
    //   })
    //   console.table(results)
    // }

    // {
    //   const results = data2json(valuesArray, undefined, {
    //     startIndex: 1,
    //     // useHeader: true,
    //     key: 'columnIndex',
    //   })
    //   console.table(results)
    // }


  })


  afterEach(() => {
    // !fs.existsSync(fullPath) || fs.unlinkSync(fullPath)
    // !fs.existsSync(excelPath) || fs.unlinkSync(excelPath)
    // !fs.existsSync(excelPath2) || fs.unlinkSync(excelPath2)
    // !fs.existsSync(excelPath3) || fs.unlinkSync(excelPath3)
    // !fs.existsSync(excelPath4) || fs.unlinkSync(excelPath4)
    // !fs.existsSync(tmpDir) || fs.rmdirSync(tmpDir)
    // !fs.existsSync(tmpDir) || fs.rmdirSync(tmpDir, { recursive: true })
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
  // */
  // const createExcel = async (csvPath: string, excelPath: string): Promise<void> => {
  //   const instances = await csv2json(csvPath)
  //   await json2excel(instances, excelPath)
  //   expect(fs.existsSync(excelPath)).toBeTruthy()
  // }
})
