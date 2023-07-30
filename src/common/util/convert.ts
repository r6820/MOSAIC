import { Code64 } from "..";
import { encodeHuffman, decodeHuffman } from "..";
// import { AES, enc } from "crypto-ts";

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
    if (text.length == 0) { return '1'}
    if (text.length == 1) { return '1'+text}
    if ([...text].reduce((p, c) => p && c==text[0], true)){
        return '1'+text[0]+text.length.toString()
    }

    const bi = encodeHuffman(text);
    const c = Code64.encodeFromString(bi)

    return '0' + c
}

export function decompress(cip: string) {
    const [f, cipherText] = [cip.slice(0,1), cip.slice(1)]

    if (f=='1'){
        if (cipherText.length==0){
            return ''
        } else if (cipherText.length==1){
            return cipherText
        }else{
            return cipherText.slice(0, 1).repeat(parseInt(cipherText.slice(1)))
        }
    }

    const bi = Code64.decodeToString(cipherText);
    const text = decodeHuffman(bi);
    return text
}

// export function createAES(key: string) {
//     return {
//         encoder: (plaintext: string) => AES.encrypt(plaintext, key).toString(),
//         decoder: (cipher: string) => AES.decrypt(cipher, key).toString(enc.Utf8)
//     }
// }