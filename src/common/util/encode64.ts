import { textDevide, padding } from "@/common";

export class Code64 {
    private static readonly TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

    static singleEncode(key: string | number): string {
        let c: string = '';
        try {
            const i = typeof key == 'string' ? parseInt(key, 2) : key
            c = Code64.TABLE[i]
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
        } finally {
            return c
        }
    }
    static singleDecode(key: string): number {
        let i: number = -1;
        try {
            i = Code64.TABLE.search(new RegExp(key));
            if (Code64.TABLE[i] == key) { }
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            }
        } finally {
            return i
        }
    }

    static encodeFromString(input: string): string {
        const a = textDevide(input, 6);
        const b = a.map(v => Code64.singleEncode(v));
        return a[a.length - 1].length + b.join('')
    }
    static decodeToString(bi: string): string {
        const [r, text] = [bi.slice(0, 1), bi.slice(1)]
        const remain = parseInt(r, 10);
        const textArray = [...text];
        return textArray.map((v, i, arr) => padding(i == arr.length - 1 ? remain : 6, Code64.singleDecode(v).toString(2))).join('')
    }
    
    static encodeFromArray(input: number[]): string {
        return input.map(v => Code64.singleEncode(v)).join('')
    }
    static decodeToArray(text: string): number[] {
        const textArray = [...text];
        return textArray.map(v => Code64.singleDecode(v))
    }
}

export class code16 {
    static encode(text: string) {
        const a = textDevide(text, 4);
        const b = a.map(v => parseInt(v, 2).toString(16))
        return b.join('') + a[a.length - 1].length;
    }
    static decode(text: string) {
        const textArray = [...text]
        const r = parseInt(textArray.pop() as string, 10);
        return textArray.map((v, i, arr) => padding(i == arr.length - 1 ? r : 4, parseInt(v, 16).toString(2))).join('')
    }
}