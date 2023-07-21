export interface Position {
    i: number;
    j: number;
    k: number;
}

export interface Piece<T> {
    position: Position;
    value: T;
}