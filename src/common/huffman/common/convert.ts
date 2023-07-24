export const convertSymbolToBits = (symbol: string): string => {
  const bits: string = symbol.charCodeAt(0).toString(2);
  return bits;
};

export const convertBitsToSymbol = (bits: string): string => {
  const symbol: string = String.fromCharCode(parseInt(bits, 2));
  return symbol;
};

export const padding = (len: number, string: string): string => {
  const pre: string = "0".repeat(len);
  const result: string = (pre + string).slice(-len);
  return result;
};
