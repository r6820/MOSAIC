export function sum(array: number[]): number {
    return array.reduce((a, b) => a + b)
}

export function argmax(array: number[]): number {
    return array.reduce((p, c, i, arr) => arr[p] > c ? p : i, 0)
}
