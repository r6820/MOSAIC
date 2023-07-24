import { occurrenceArray } from "../global.d";

const partitioning = (
  mda: occurrenceArray,
  start: number,
  end: number,
): number => {
  const pivot: number = mda[end][1];
  let pivotIndex: number = start;
  for (let i: number = start; i < end; i++) {
    if (mda[i][1] > pivot) continue;
    [mda[i], mda[pivotIndex]] = [mda[pivotIndex], mda[i]];
    pivotIndex++;
  }
  [mda[pivotIndex], mda[end]] = [mda[end], mda[pivotIndex]];
  return pivotIndex;
};

export const sortQuickly = (
  mda: occurrenceArray,
  start: number = 0,
  end: number = mda.length - 1,
): void => {
  if (start >= end) return;
  const pivotIndex: number = partitioning(mda, start, end);
  sortQuickly(mda, start, pivotIndex - 1);
  sortQuickly(mda, pivotIndex + 1, end);
};
