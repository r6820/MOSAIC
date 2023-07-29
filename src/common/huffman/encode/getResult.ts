import { bitsTable } from "../global";

export const generateResultBits = (
  plane: string,
  bitsTable: bitsTable,
): string => {
  let stringArray: string[] = [];
  let bitArray: string[] = [];
  for (let i = 0; i < bitsTable.length; i++) {
    [stringArray[i], bitArray[i]] = [bitsTable[i][0], bitsTable[i][1]];
  }
  let resultString = "";
  // 文字列配列の中で対象の文字とマッチするインデックスのビット列を結果に追加する
  for (let i = 0; i < plane.length; i++) {
    const index: number = stringArray.indexOf(plane[i]);
    resultString += bitArray[index];
  }
  return resultString;
};
