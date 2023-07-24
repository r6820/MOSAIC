import { rebuiltTreeArray, treeArray, bitsTable } from "../global.d";

export const generateBitsTableFromTreeArray = (
  tree: treeArray,
  bitsTable: bitsTable = new Array(0) as bitsTable,
  bit: string = "",
): bitsTable => {
  if (tree[0] !== null) {
    bitsTable.push([tree[0], bit]);
    return bitsTable;
  }
  if (!tree[2]) {
    throw new Error("You assigned wrong tree as argument");
  }
  const nextBitsTable: bitsTable = generateBitsTableFromTreeArray(
    tree[2][0],
    bitsTable,
    bit + "0",
  );
  return generateBitsTableFromTreeArray(tree[2][1], nextBitsTable, bit + "1");
};

export const generateBitsTableFromRebuiltTreeArray = (
  tree: rebuiltTreeArray,
  bitsTable: bitsTable = new Array(0) as bitsTable,
  bit: string = "",
): bitsTable => {
  if (tree[0] !== null) {
    bitsTable.push([tree[0], bit]);
    return bitsTable;
  }
  if (!tree[1]) {
    throw new Error("You assigned wrong tree as argument");
  }
  const nextBitsTable: bitsTable = generateBitsTableFromRebuiltTreeArray(tree[1][0], bitsTable, bit + "0");
  return generateBitsTableFromRebuiltTreeArray(tree[1][1], nextBitsTable, bit + "1");
};
