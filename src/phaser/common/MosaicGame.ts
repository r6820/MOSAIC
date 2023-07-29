import { MosaicScene, phaserConstants as Constants, Position, Piece } from "../";
import { arrayDevide, compress, decompress } from "../../common";
import { Code64 } from "../../common";


export class Board<T> extends Array<Array<Array<T>>>{
    private maxStones: number = 0;
    constructor(...pieces: T[][][]) {
        super(...pieces);
        const a = this.maxStones = this.length * (this.length + 1) * (2 * this.length + 1) / 6
        this.maxStones = this.length % 4 == 1 ? (a - 1) / 2
            : this.length % 4 == 2 ? (a + 1) / 2
                : a / 2
    }

    public isWin(player: number): boolean {
        return this.count(p => p.value == player) >= this.maxStones
    }

    public isDone(): boolean {
        return this.isWin(Constants.playerId.first) || this.isWin(Constants.playerId.second)
    }

    public reverse(): Board<T> {
        return new Board(...[...this].reverse())
    }

    public mapPiece<U>(callbackfn: (piece: Piece<T>) => U): Board<U> {
        return new Board(...this.map(
            (v1, i) => v1.map(
                (v2, j) => v2.map(
                    (v3, k) => callbackfn({ position: { i, j, k }, value: v3 })
                )
            )
        ))
    }

    public forEachPiece(callbackfn: (piece: Piece<T>) => void): void {
        this.forEach(
            (v1, i) => v1.forEach(
                (v2, j) => v2.forEach(
                    (v3, k) => callbackfn({ position: { i, j, k }, value: v3 })
                )
            )
        )
    }

    public count(conditionfn: (piece: Piece<T>) => boolean): number {
        return this.where(conditionfn).length
    }

    public countBelow(conditionfn: (v: T) => boolean): Board<number> {
        return this.mapPiece(piece => {
            const { position: { i, j, k } } = piece;
            return i == this.length - 1 ? 0 :
                Number(conditionfn(this[i + 1][j][k]))
                + Number(conditionfn(this[i + 1][j + 1][k]))
                + Number(conditionfn(this[i + 1][j][k + 1]))
                + Number(conditionfn(this[i + 1][j + 1][k + 1]))
        }
        )
    }

    public where(conditionfn: (piece: Piece<T>) => boolean): Piece<T>[] {
        const arr: Piece<T>[] = [];
        this.forEachPiece(Piece => {
            if (conditionfn(Piece)) {
                arr.push(Piece)
            }
        })
        return arr;
    }

    public get(position: Position): T {
        const { i, j, k } = position;
        return this[i][j][k];
    }

    public set(piece: Piece<T>) {
        const { position: { i, j, k }, value: value } = piece
        this[i][j][k] = value;
    }

    public copy(): Board<T> {
        return this.mapPiece(({ value: v }) => v);
    }

    private merge<U, V>(otherBoard: Board<U>, mergeFunction: (v1: T, v2: U) => V): Board<V> {
        return this.mapPiece(({ position: pos, value: v }) => mergeFunction(v, otherBoard.get(pos)))
    }

    public legalPieces(): Board<boolean> {
        const isDone = this.isDone();
        const below = this.countBelow(v => v != 0);
        return this.mapPiece(
            piece => {
                const { position: a, value: v } = piece
                return !isDone && v == 0 && (a.i == this.length - 1 || below.get(a) == 4)
            }
        )
    }

    public legalActions(): Position[]{
        return this.legalPieces().where(({value})=>value).map(({position})=>position)
    }

    public next(piece: Piece<number>): Board<number>[] {
        let board = this.copy() as Board<number>;
        board.set(piece);
        const boardArray: Board<number>[] = [board];
        let l: Piece<number>[] = [];
        do {
            const fp = board.countBelow(v => v == Constants.playerId.first).mapPiece(p => p.value >= 3)
            const sp = board.countBelow(v => v == Constants.playerId.second).mapPiece(p => p.value >= 3)
            l = fp.merge(sp, (v1, v2) =>
                v1 ? Constants.playerId.first :
                    v2 ? Constants.playerId.second :
                        0
            ).merge(board.legalPieces(), (v1, v2) => v2 ? v1 : 0)
                .where(({ value: v }) => v != 0)
                .map(p => {
                    board = board.copy();
                    board.set(p);
                    boardArray.push(board);
                    return p
                });
        } while (l.length > 0)
        return boardArray
    }

    private nextOne(piece: Piece<number>): Board<number> {
        return this.next(piece).at(-1) as Board<number>
    }

    public nextAll(value: number): Board<number>[] {
        return this.legalPieces().where(({ value }) => value).map(({ position }) => this.nextOne({ position, value }))
    }

    public flip() {
        return this.mapPiece(({ value }) => value == Constants.playerId.first ? Constants.playerId.second : Constants.playerId.first)
    }
}

export class GameRecord {
    private size: number = Constants.defaultSize;
    private moves: Piece<number>[] = [];
    private record: Array<Board<number>> = [];
    public length: number = 0;
    constructor(size: number, moves?: Piece<number>[]) {
        this.size = size;
        this.record.push(this.initialBoard());
        if (moves != null) {
            this.moves = moves;
            this.moves.forEach((p, i) => {
                this.record.push(this.record[i].next(p).at(-1) as Board<number>)
            });
        }
        this.length = this.record.length;
    }

    private initialBoard() {
        const board = new Board<number>(
            ...new Array<number>(this.size).fill(0).map((_, i) =>
                new Array<Array<number>>(i + 1).fill([0]).map(() =>
                    new Array<number>(i + 1).fill(0)
                )
            )
        );
        if (this.size % 2 == 1) {
            board.set({
                position: { i: this.size - 1, j: (this.size - 1) / 2, k: (this.size - 1) / 2 },
                value: Constants.playerId.neutral
            })
        }

        return board
    }

    public get(num: number) {
        return this.record[num]
    }

    public move(movesNum: number, action: Piece<number>) {
        this.moves.push(action);

        this.record.splice(movesNum);
        const boardArray = this.record[movesNum - 1].next(action);
        this.record[movesNum] = boardArray.at(-1) as Board<number>;
        this.length = this.record.length;
        return boardArray
    }

    public exportData() {
        const arr = [this.size, ...this.moves.map(({ position: { i, j, k } }) => [i, j, k])].flat();
        return Code64.encodeFromArray(arr)
    }

    static importData(ciphertext: string): GameRecord {
        const arr = Code64.decodeToArray(ciphertext);
        const size = arr.shift() as number;
        const moves = arrayDevide(arr, 3).map((a, i) => ({ position: { i: a[0], j: a[1], k: a[2] }, value: i % 2 == 0 ? Constants.playerId.first : Constants.playerId.second }));
        return new GameRecord(size, moves)
    }
}

export class MosaicGame {
    public scene: MosaicScene;
    public gameRecord: GameRecord;
    private movesNum: number = 0;
    public board: Board<number>;
    constructor(scene: MosaicScene) {
        this.scene = scene;
        this.gameRecord = new GameRecord(this.scene.size);
        this.board = this.gameRecord.get(this.movesNum);
    }

    public getPoint(player: number): number {
        return this.board.count(p => p.value == player)
    }

    public move(pos: Position) {
        if (this.board.isDone()) { return }
        this.movesNum += 1;
        const player = this.movesNum % 2 == 1 ? Constants.playerId.first : Constants.playerId.second;
        const action: Piece<number> = { position: pos, value: player };
        const boardArray = this.gameRecord.move(this.movesNum, action);
        console.log('place', action);
        this.board = boardArray.at(-1) as Board<number>;

        this.scene.render(boardArray);
    }

    public prev() {
        if (this.movesNum == 0) { return }
        console.log('prev');

        this.movesNum -= 1;

        this.board = this.gameRecord.get(this.movesNum);
        this.scene.render();
    }

    public next() {
        if (this.movesNum == this.gameRecord.length - 1) { return }
        console.log('next');

        this.movesNum += 1;

        this.board = this.gameRecord.get(this.movesNum);

        this.scene.render();
    }

    public exportData(): string {
        console.log('save');
        return compress(this.gameRecord.exportData())
    }

    public importData(data: string) {
        console.log('load');
        this.movesNum = 0;
        this.gameRecord = GameRecord.importData(decompress(data));
        this.board = this.gameRecord.get(this.movesNum);
        this.scene.render();
    }
}