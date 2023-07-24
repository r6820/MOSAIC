import { treeArray } from "../global.d";
import { convertSymbolToBits, padding } from "../common/convert.js";

export const encodeTree = (
  huffmanTree: treeArray,
  resultString: string = "",
): string => {
  if (huffmanTree[0] !== null) {
    const symbolBits: string = convertSymbolToBits(huffmanTree[0]);
    return resultString += `1${padding(8, symbolBits)}`;
  }
  resultString += "0";
  if (!huffmanTree[2]) throw new Error("You assigned wrong array...");
  const resultLeft: string = encodeTree(huffmanTree[2][0], resultString);
  return encodeTree(huffmanTree[2][1], resultLeft);
};

export const getEncodedTreeLength = (encodedTree: string): string => {
  const lengthNumber: number = encodedTree.length;
  const lengthBits: string = padding(16, lengthNumber.toString(2));
  return lengthBits;
};
