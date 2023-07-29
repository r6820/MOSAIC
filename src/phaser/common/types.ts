export type Position = {
    i: number;
    j: number;
    k: number;
}

export type Piece<T> = {
    position: Position;
    value: T;
}