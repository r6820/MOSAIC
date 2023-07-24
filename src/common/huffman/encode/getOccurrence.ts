import { occurrenceArray, treeArray } from "../global.d";

const escapeRegex = (str: string): string => {
  return str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, "\\$&");
};

export const getOccurence = (plane: string): occurrenceArray => {
  let string: string = plane;
  const occurrenceArray: occurrenceArray = new Array(0) as occurrenceArray;
  while (string.length > 0) {
    const regexString: string = escapeRegex(string[0]);
    const regExp = new RegExp(regexString, "g");
    const occurrence: number = (string.match(regExp) || []).length;
    const relation: treeArray = [string[0], occurrence];
    occurrenceArray.push(relation);
    string = string.replace(regExp, "");
  }
  return occurrenceArray;
};
