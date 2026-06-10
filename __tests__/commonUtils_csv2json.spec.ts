import * as fs from 'fs'
import * as path from 'path'
import { csv2json } from '../src/commonUtils'
import { isAddresses } from '../src/samples/data'
import { getAndExtract } from '../src/utils'
import { assertBasicArray } from './utils'



describe('テスト', () => {
  jest.setTimeout(30000);

  const url = 'http://jusyo.jp/downloads/new/csv/csv_13tokyo.zip'
  let csvPath = ''
  const baseDir: string = path.resolve('')
  let fullPath = ''

  beforeEach(async () => {
    csvPath = await getAndExtract(url)
    fullPath = path.join(baseDir, csvPath)

    console.log(`baseDir: ${baseDir}`)
    console.log(`csvPath: ${csvPath}`)
    console.log(`fullPath: ${fullPath}`)
  })

  it('getテスト1', async () => {
    expect(fs.existsSync(fullPath)).toBeTruthy()

    const instances = await csv2json(fullPath)

    if (isAddresses(instances)) {
      assertBasicArray(instances, 22)
      const addresses = instances.filter((instance) => instance.郵便番号 === '100-0000')
      console.table(addresses)

      // for (const obj of instances.filter((instance) => (instance as Address).郵便番号 === '100-0000')) {
      //   console.log(obj)
      // }
    }
  })

  afterEach(() => {
    // await new Promise<void>((resolve, reject) => {
    //   fs.unlink(fullPath, (error) => (error ? reject(error) : resolve()))
    // })
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
  })
})

