import { Code64 } from "..";
import { encodeHuffman, decodeHuffman } from "..";
import { AES, enc } from "crypto-ts";

export function textDevide(text: string, length: number): string[] {
    const arr = [...text];
    return arr.reduce((acc, _, i) => i % length ? acc : [...acc, arr.slice(i, i + length).join('')], new Array);
}

export function arrayDevide<T>(arr: T[], length: number): T[][] {
    return arr.reduce((acc, _, i) =>
        i % length ? acc : [...acc, arr.slice(i, i + length)], new Array<Array<T>>()
    )
}

export function compress(text: string) {
    const bi = encodeHuffman(text);
    const c = Code64.encodeFromString(bi)
    return c
}

export function decompress(cip: string) {
    const r = parseInt(cip.slice(-1) as string, 10);
    const bi = Code64.decodeToString(cip.slice(0, -1), r);
    return decodeHuffman(bi)
}

export function createAES(key: string) {
    return {
        encoder: (plaintext: string) => AES.encrypt(plaintext, key).toString(),
        decoder: (cipher: string) => AES.decrypt(cipher, key).toString(enc.Utf8)
    }
}