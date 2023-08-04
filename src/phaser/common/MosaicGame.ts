import { MosaicScene, Position, Piece, loadModel, Action, playerId, defaultSize, delayFrames } from "@/phaser";
import { arrayDevide, compress, decompress, Code64 } from "@/common";


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
        return this.isWin(playerId.first) || this.isWin(playerId.second)
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

    public merge<U, V>(otherBoard: Board<U>, mergeFunction: (v1: T, v2: U) => V): Board<V> {
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

    public legalActions(): Position[] {
        return this.legalPieces().where(({ value }) => value).map(({ position }) => position)
    }

    public next(piece: Piece<number>): [Board<number>, Position[]] {
        const board = this.copy() as Board<number>;
        board.set(piece);
        const positionArray: Position[] = [piece.position];
        let l: Piece<number>[] = [];
        do {
            const fp = board.countBelow(v => v == playerId.first).mapPiece(p => p.value >= 3)
            const sp = board.countBelow(v => v == playerId.second).mapPiece(p => p.value >= 3)
            l = fp.merge(sp, (v1, v2) =>
                v1 ? playerId.first :
                    v2 ? playerId.second :
                        0
            ).merge(board.legalPieces(), (v1, v2) => v2 ? v1 : 0)
                .where(({ value: v }) => v != 0)
                .map(p => {
                    board.set(p);
                    positionArray.push(p.position);
                    return p
                });
        } while (l.length > 0)
        return [board, positionArray]
    }

    public nextAll(value: number): Board<number>[] {
        return this.legalPieces().where(({ value }) => value).map(({ position }) => this.next({ position, value })[0])
    }

    public flip() {
        return this.mapPiece(({ value }) => value == playerId.first ? playerId.second : value == playerId.second ? playerId.first : value)

    }
}

export class GameRecord {
    private size: number;
    private moves: Piece<number>[];
    private record: Array<Board<number>> = [];
    public length: number = 0;
    constructor(size: number = defaultSize, moves: Piece<number>[] = []) {
        this.size = size;
        this.record.push(this.initialBoard());
        this.moves = moves;
        this.moves.forEach((p, i) => {
            this.record.push(this.record[i].next(p)[0]);
        });
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
                value: playerId.neutral
            })
        }

        return board
    }

    public get(num: number) {
        return this.record[num]
    }

    public move(movesNum: number, action: Piece<number>): [Board<number>, Position[]] {
        this.moves.push(action);
        this.record.splice(movesNum);
        const [board, positionArray] = this.record[movesNum - 1].next(action);
        this.record[movesNum] = board;
        this.length = this.record.length;
        return [board, positionArray]
    }

    public exportData() {
        const arr = [this.size, ...this.moves.map(({ position: { i, j, k } }) => [i, j, k])].flat();

        return Code64.encodeFromArray(arr)
    }

    public importData(ciphertext: string): GameRecord {
        const arr = Code64.decodeToArray(ciphertext);
        const size = arr.shift() as number;
        const moves = arrayDevide(arr, 3).map((a, i) => ({ position: { i: a[0], j: a[1], k: a[2] }, value: i % 2 == 0 ? playerId.first : playerId.second }));

        return new GameRecord(size, moves)
    }
}

export class MosaicGame {
    private isAI: { first: boolean, second: boolean };
    public size: number;
    public scene: MosaicScene;
    public gameRecord: GameRecord;
    private movesNum: number = 0;
    public player: number = playerId.first;
    public board: Board<number>;
    private aiAction!: Action;
    public turn: () => Promise<void> = async () => { };
    constructor(size: number = defaultSize, [FPisAI, SPisAI]: [boolean, boolean] = [false, false]) {
        this.isAI = { first: FPisAI, second: SPisAI };
        this.size = size;
        this.gameRecord = new GameRecord(this.size);
        this.board = this.gameRecord.get(this.movesNum);
        const human = async () => {
            console.log(' ===== Player turn ===== ');
            this.scene.setInteractive(true);
        }
        const ai = async () => {
            this.aiAction = this.aiAction || await loadModel(this.size);
            console.log(' ===== AI turn ===== ');
            const startTime = Date.now();
            this.scene.setInteractive(false);
            const pos = this.aiAction(this.movesNum % 2 == 0 ? this.board : this.board.flip());
            const endTime = Date.now();
            console.log('predict:', endTime - startTime, 'ms');
            console.log('position', pos);
            this.move(pos);
        }
        this.turn = async () => {
            ((this.movesNum % 2 == 0 ? FPisAI : SPisAI) ? ai : human)();
        }
        this.scene = new MosaicScene(this);
    }

    public getPoint(player: number): number {
        return this.board.count(p => p.value == player)
    }

    public move(pos: Position) {
        this.scene.setInteractive(false);
        if (this.board.isDone()) { return }
        const action: Piece<number> = { position: pos, value: this.player };
        this.movesNum += 1;
        this.player = this.movesNum % 2 == 0 ? playerId.first : playerId.second;
        const [board, positionArray] = this.gameRecord.move(this.movesNum, action);
        this.board = board;
        this.scene.render(positionArray);
    }

    public prev() {
        if (this.movesNum == 0) { return }
        console.log('prev');

        this.movesNum -= 1;
        this.player = this.movesNum % 2 == 0 ? playerId.first : playerId.second;
        if (this.isAI[this.movesNum % 2 == 0 ? 'first' : 'second']) {
            this.prev();
        } else {
            this.board = this.gameRecord.get(this.movesNum);
            this.scene.allRerender();
            this.turn();
        }
    }

    public next() {
        if (this.movesNum == this.gameRecord.length - 1) { return }
        console.log('next');

        this.movesNum += 1;
        this.player = this.movesNum % 2 == 0 ? playerId.first : playerId.second;
        if (this.isAI[this.movesNum % 2 == 0 ? 'first' : 'second']) {
            this.next()
        } else {
            this.board = this.gameRecord.get(this.movesNum);
            this.scene.allRerender();
            this.turn();
        }
    }

    public exportData(): string {
        console.log('save');
        return compress(this.gameRecord.exportData())
    }

    public importData(data: string) {
        console.log('load');
        this.movesNum = 0;
        this.gameRecord = this.gameRecord.importData(decompress(data));
        this.board = this.gameRecord.get(this.movesNum);
    }
}