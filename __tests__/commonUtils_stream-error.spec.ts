/**
 * issue #50: ストリームの 'error' が未処理で、存在しないファイルを渡すと
 * Promise が settle せず uncaughtException になる問題の回帰テスト。
 * 正常系（実ファイルの読み込み成功）も併せて固定する。
 */
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as XlsxPopulate from 'xlsx-populate'
import { excel2json, excel2json2, excelStream2json, csv2json, csvStream2json } from '../src/commonUtils'

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecrw-test-'))

const createExcelFixture = async (filePath: string): Promise<void> => {
    const workbook = await XlsxPopulate.fromBlankAsync()
    const sheet = workbook.sheet(0)
    sheet.name('Sheet1')
    sheet.cell('A1').value('name')
    sheet.cell('B1').value('value')
    sheet.cell('A2').value('foo')
    sheet.cell('B2').value(1)
    sheet.cell('A3').value('bar')
    sheet.cell('B3').value(2)
    await workbook.toFileAsync(filePath)
}

const createCsvFixture = (filePath: string): void => {
    fs.writeFileSync(filePath, 'name,value\nfoo,1\nbar,2\n', 'utf-8')
}

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('excel2json / excelStream2json のストリームエラー処理（#50）', () => {
    it('存在しないファイルパスでは reject される（uncaughtException にならない）', async () => {
        const missing = path.join(tmpDir, 'no-such-file.xlsx')
        await expect(excel2json(missing)).rejects.toThrow(/ENOENT/)
    })

    it('excel2json2（オブジェクト引数API）でも reject される', async () => {
        const missing = path.join(tmpDir, 'no-such-file2.xlsx')
        await expect(excel2json2({ filePath: missing })).rejects.toThrow(/ENOENT/)
    })

    it('excelStream2json: エラーを起こすストリームでは reject される', async () => {
        const stream = fs.createReadStream(path.join(tmpDir, 'no-such-stream.xlsx'))
        await expect(excelStream2json(stream)).rejects.toThrow(/ENOENT/)
    })

    it('正常系: 実ファイルを読み込んで行データを返す（回帰確認）', async () => {
        const file = path.join(tmpDir, 'ok.xlsx')
        await createExcelFixture(file)
        const rows = (await excel2json(file)) as Record<string, unknown>[]
        expect(rows).toHaveLength(2)
        expect(rows[0]).toMatchObject({ name: 'foo', value: 1 })
        expect(rows[1]).toMatchObject({ name: 'bar', value: 2 })
    })
})

describe('csv2json / csvStream2json のストリームエラー処理（#50 同根）', () => {
    it('存在しないファイルパスでは reject される（uncaughtException にならない）', async () => {
        const missing = path.join(tmpDir, 'no-such-file.csv')
        await expect(csv2json(missing, 'utf-8')).rejects.toThrow(/ENOENT/)
    })

    it('csvStream2json: エラーを起こすストリームでは reject される', async () => {
        const stream = fs.createReadStream(path.join(tmpDir, 'no-such-stream.csv'))
        await expect(csvStream2json(stream, 'utf-8')).rejects.toThrow(/ENOENT/)
    })

    it('正常系: 実ファイルを読み込んで行データを返す（回帰確認）', async () => {
        const file = path.join(tmpDir, 'ok.csv')
        createCsvFixture(file)
        const rows = (await csv2json(file, 'utf-8')) as Record<string, unknown>[]
        expect(rows).toHaveLength(2)
        expect(rows[0]).toMatchObject({ name: 'foo', value: '1' })
        expect(rows[1]).toMatchObject({ name: 'bar', value: '2' })
    })
})
