import { Board } from "@/phaser";

export type Position = {
    i: number;
    j: number;
    k: number;
}

export type Piece<T> = {
    position: Position;
    value: T;
}

export type Action = (board: Board<number>) => Position;

export type Tasks = { task: () => void, n: number }[];

export type player = 'human' | number;