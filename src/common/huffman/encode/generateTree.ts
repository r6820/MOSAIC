import { occurrenceArray, treeArray } from "../global";
import { sortQuickly } from "./sort.js";

export const generateTree = (
  occurrenceArray: occurrenceArray,
): occurrenceArray => {
  if (occurrenceArray.length <= 1) return occurrenceArray;
  sortQuickly(occurrenceArray);
  const parsedArray: treeArray = [
    null,
    occurrenceArray[0][1] + occurrenceArray[1][1],
    [occurrenceArray[0], occurrenceArray[1]],
  ];
  occurrenceArray.splice(0, 2);
  occurrenceArray.unshift(parsedArray);
  return generateTree(occurrenceArray);
};
