import { bitsTable, dividedObj, rebuiltTreeArray } from "../global.d";
import { convertBitsToSymbol } from "../common/convert";
import { generateBitsTableFromRebuiltTreeArray } from "../common/generateBitsTable";

export const rebuildHuffmanTree = ( bits: string, resultArray: rebuiltTreeArray ): string => {
  if (bits === "") return bits;
  const firstBits: string = bits.slice(0, 1);
  bits = bits.slice(1);
  if (firstBits === "1") {
    const symbolBits: string = bits.slice(0, 8);
    bits = bits.slice(8);
    const symbol: string = convertBitsToSymbol(symbolBits);
    resultArray[0] = symbol;
    return bits;
  }
  resultArray.push([[null], [null]]);
  if (!resultArray[1]) throw new Error("resultArray has no index 1");
  const result: string = rebuildHuffmanTree( bits, resultArray[1][0] );
  return rebuildHuffmanTree(result, resultArray[1][1]);
};

// 再帰を使うとスタックオーバーフローするのでループで書く
const parseBits = (bits: string, bitsTable: bitsTable): string => {
  bitsTable.sort((a, b) => {
    return a[1].length - b[1].length;
  });
  let result: string = "";
  let queueString: string = "";
  let remainingBits: string = bits;
  while (remainingBits !== "") {
    queueString += remainingBits[0];
    remainingBits = remainingBits.slice(1);
    for (let i = 0; i < bitsTable.length; i++) {
      if (queueString.length < bitsTable[i][1].length) break;
      if (queueString.length > bitsTable[i][1].length) continue;
      if (queueString === bitsTable[i][1]) {
        result += bitsTable[i][0];
        queueString = "";
        break;
      }
    }
  }
  return result;
};

export const spliceString = (string: string, divisionNumber: number): dividedObj => {
  const spliced: string = string.slice(0, divisionNumber);
  const remaining: string = string.slice(divisionNumber);
  return { spliced, remaining };
};

export const decodeHuffman = (encodeResult: string) => {
  const headerBits: dividedObj = spliceString(encodeResult, 16);
  const headerLength: number = parseInt(headerBits.spliced, 2);
  const treeAndContents: dividedObj = spliceString( headerBits.remaining, headerLength );
  const rebuiltTree: rebuiltTreeArray = [null];
  rebuildHuffmanTree(treeAndContents.spliced, rebuiltTree);
  const bitsTable: bitsTable = generateBitsTableFromRebuiltTreeArray(rebuiltTree);
  const decodedString: string = parseBits(treeAndContents.remaining, bitsTable);
  return decodedString;
};
