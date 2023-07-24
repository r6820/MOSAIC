import { bitsTable, occurrenceArray, treeArray } from "../global.d";
import { getOccurence } from "./getOccurrence.js";
import { generateTree } from "./generateTree.js";
import { generateResultBits } from "./getResult.js";
import { encodeTree, getEncodedTreeLength } from "./encodeTree.js";
import { generateBitsTableFromTreeArray } from "../common/generateBitsTable.js";

export const encodeHuffman = (plane: string): string => {
  const occurrenceArray: occurrenceArray = getOccurence(plane);
  const huffmanTree: treeArray = generateTree(occurrenceArray)[0];
  const bitsTable: bitsTable = generateBitsTableFromTreeArray(huffmanTree);
  const encodedTree: string = encodeTree(huffmanTree);
  const encodedTreeLength: string = getEncodedTreeLength(encodedTree);
  const result: string = generateResultBits(plane, bitsTable);
  return encodedTreeLength + encodedTree + result;
};
