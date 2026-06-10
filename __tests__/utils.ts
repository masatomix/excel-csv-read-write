import { Address, isAddresses } from "../src/samples/data"


export const assertBasicArray = (actualInstances: unknown[], expectedColumnCount: number): void => {
    expect(actualInstances.length).toBeGreaterThanOrEqual(1) // 1件以上はある
    expect(isAddresses(actualInstances)).toBeTruthy()

    if (isAddresses(actualInstances)) {
        // Address に型ガード
        for (const instance of actualInstances) {
            expect(Object.keys(instance).length).toBe(expectedColumnCount) // カラム数チェック

            const resultFlag = Object.keys(instance).map(tmpKey => {
                const key = tmpKey as keyof Address
                if (instance[key] == null) console.log(`${key} is undefined`)
                return instance[key]
            }).every(value => value !== undefined)

            if (!resultFlag) console.log('undefinedアリ')
            // expect(resultFlag).toBeTruthy()

            // const flag = Object.keys(instance).reduce((prevFlag, tmpKey) => {
            //     const key = tmpKey as keyof Address
            //     instance[key] ?? console.log(`${key} is undefined`)
            //     return prevFlag && instance[key] !== undefined
            // }, true)

            // for (const tmpKey of Object.keys(instance)) {
            //     const key = tmpKey as keyof Address
            //     instance[key] ?? console.log(`${key} is undefined`)
            //     // expect(instance[key]).not.toBeUndefined()
            // }
        }
    }
}
