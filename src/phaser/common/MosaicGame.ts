import { MosaicScene, Constants, Position, Piece } from "../";
import { compress, decompress, arrayDevide} from "../../common";
import { Code64 } from "../../common";

export class Board<T> extends Array<Array<Array<T>>>{
    private maxStones: number = 0;
    public background: boolean;
    constructor(background: boolean, ...pieces: T[][][]) {
        super(...pieces);
        this.background = background;
        const a = this.maxStones = this.length * (this.length + 1) * (2 * this.length + 1) / 6
        this.maxStones = this.length % 4 == 1 ? (a - 1) / 2
            : this.length % 4 == 2 ? (a + 1) / 2
                : a / 2
    }

    private isWin(player: number): boolean {
        return this.count(p => p.value == player) >= this.maxStones
    }

    public isDone(): boolean {
        return this.isWin(Constants.playerId.first) || this.isWin(Constants.playerId.second)
    }

    public reverse(): Board<T> {
        return new Board(this.background, ...[...this].reverse())
    }

    public mapPiece<U>(callbackfn: (piece: Piece<T>) => U): Board<U> {
        return new Board(this.background, ...this.map(
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

    public copy(): Board<number> {
        return this.mapPiece(p => Number(p.value));
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

    public next(piece: Piece<number>): Board<number> {
        const board = this.copy();
        board.set(piece);
        this.log('place', piece);
        let fp: Piece<number>[] = [];
        let sp: Piece<number>[] = [];
        do {
            const lp = board.legalPieces();
            fp = board.countBelow(v => v == Constants.playerId.first).where(p => lp.get(p.position) && p.value >= 3);
            sp = board.countBelow(v => v == Constants.playerId.second).where(p => lp.get(p.position) && p.value >= 3);

            this.consecutivePlace(board, fp, Constants.playerId.first)
            this.consecutivePlace(board, sp, Constants.playerId.second)
        } while (fp.length + sp.length > 0)
        return board;
    }

    private consecutivePlace(board: Board<number>, plcArray: Piece<number>[], player: number) {
        plcArray.forEach(({ position: pos }) => {
            if (!board.isWin(player)) {
                this.log(board.count(p => p.value == player), board.maxStones);

                const p = { position: pos, value: player };
                board.set(p);
                this.log('place', p);
            }
        });

        if (board.isWin(player)) { plcArray.splice(0) }
    }
    private log(...data: any[]) {
        if (!this.background) { console.log(...data); }
    }
}

class GameRecord {
    private size: number = Constants.defaultSize;
    private moves: Piece<number>[] = [];
    private record: Array<Board<number>> = [];
    public length: number = 0;
    constructor(size: number, moves?: Piece<number>[]) {
        this.size = size;
        if (moves == null) {
            this.record.push(this.initialBoard());
        } else {
            this.record.push(this.initialBoard(true));
            this.moves = moves;
            this.moves.forEach((p, i) => {
                this.record.push(this.record[i].next(p))
            });
            this.record.forEach(v => v.background = false);
        }
        this.length = this.record.length;
    }

    private initialBoard(background: boolean = false) {
        const board = new Board<number>(background,
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
        this.record[movesNum] = this.record[movesNum - 1].next(action);
        this.length = this.record.length;
        return this.record[movesNum]
    }

    public exportData() {
        const arr = [this.size, ...this.moves.map(({ position: { i, j, k }, value }) => [i, j, k, value])].flat()
        return Code64.encodeFromArray(arr)
    }

    public importData(ciphertext: string): { size: number, moves: Piece<number>[] } {
        // const arr = fromJSONtoArray<number>(json);
        const arr = Code64.decodeToArray(ciphertext);
        const size = arr.shift() as number
        let moves: Piece<number>[] = [];
        if (size != this.size || arr.length % 4 != 0) {
            const message = 'Invalid Data!'
            console.log(message);
            alert(message);
            console.log('size', size);

            moves = [];
        } else {
            moves = arrayDevide(arr, 4).map(a => ({ position: { i: a[0], j: a[1], k: a[2] }, value: a[3] }))
        }

        return { size: size, moves: moves }
    }
}

export class MosaicGame {
    private scene: MosaicScene;
    private gameRecord: GameRecord;
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
        const action: Piece<number> = { position: pos, value: player }
        this.board = this.gameRecord.move(this.movesNum, action)

        this.scene.render();
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
}