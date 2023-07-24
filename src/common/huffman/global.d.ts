export type treeArray = [string | null, number, [treeArray, treeArray]?];
export type rebuiltTreeArray = [
  string | null,
  [rebuiltTreeArray, rebuiltTreeArray]?,
];
export type occurrenceArray = treeArray[];
export type bitsTable = [string, string][];
export interface dividedObj {
  spliced: string;
  remaining: string;
}
