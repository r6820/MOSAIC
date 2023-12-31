import { MosaicScene, Position, Piece, MCTS, playerId, defaultSize, player } from "@/phaser";
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

    public firstPlayerValue(): number {
        return this.count(p => p.value == playerId.first) - this.count(p => p.value == playerId.second)
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

    public op<U, V>(otherBoard: Board<U>, mergeFunction: (v1: T, v2: U) => V): Board<V> {
        return this.mapPiece(({ position: pos, value: v }) => mergeFunction(v, otherBoard.get(pos)))
    }

    public legalActions(): Board<boolean> {
        const below = this.countBelow(v => v != 0);
        return this.mapPiece(
            piece => {
                const { position: a, value: v } = piece
                return v == 0 && (a.i == this.length - 1 || below.get(a) == 4)
            }
        )
    }

    public legalActionArray(): Position[] {
        return this.legalActions().where(({ value }) => value).map(({ position }) => position)
    }

    public next(piece: Piece<number>): [Board<number>, Position[]] {
        const board = this.copy() as Board<number>;
        board.set(piece);
        const positionArray: Position[] = [piece.position];
        let l: Piece<number>[] = [];
        do {
            l = [];
            const fp = board.countBelow(v => v == playerId.first).mapPiece(p => p.value >= 3)
            const sp = board.countBelow(v => v == playerId.second).mapPiece(p => p.value >= 3)
            fp.op(sp, (v1, v2) =>
                v1 ? playerId.first :
                    v2 ? playerId.second :
                        0
            ).op(board.legalActions(), (v1, v2) => v2 ? v1 : 0)
                .where(({ value: v }) => v != 0)
                .forEach(p => {
                    if (!board.isWin(p.value)) {
                        board.set(p);
                        l.push(p)
                        positionArray.push(p.position);
                    }
                })
        } while (l.length > 0)
        return [board, positionArray]
    }

    public nextAll(value: number): Board<number>[] {
        return this.legalActions().where(({ value }) => value).map(({ position }) => this.next({ position, value })[0])
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
        this.moves.splice(movesNum-1);
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
    private players: { 1: 'human' | 'Online' | MCTS, 2: 'human' | 'Online' | MCTS };
    public size: number;
    public scene: MosaicScene;
    public gameRecord: GameRecord;
    private movesNum: number = 0;
    public userState: 0 | 1 | 2 = 0;
    private setMovesNum: (n: number) => void = (n) => {
        this.movesNum = n == -1 ? this.gameRecord.length - 1 : n;
    };
    private finish: () => void = () => { };
    public board: Board<number>;
    constructor(size: number = defaultSize, [player1, player2]: [player, player] = ['human', 'human']) {
        this.players = {
            1: typeof player1 == 'number' ? new MCTS(size, player1) : player1,
            2: typeof player2 == 'number' ? new MCTS(size, player2) : player2
        };
        this.size = size;
        this.gameRecord = new GameRecord(this.size);
        this.board = this.gameRecord.get(this.movesNum);
        this.scene = new MosaicScene(this);
    }

    public boardReset() {
        this.gameRecord = new GameRecord(this.size);
        this.setMovesNum(0);
        this.board = this.gameRecord.get(this.movesNum);
        this.scene.allRerender();
    }

    public onChangeMovesNum(onChangeFunc: (_n: number) => void) {
        this.setMovesNum = (n) => {
            this.movesNum = n == -1 ? this.gameRecord.length - 1 : n;
            onChangeFunc(this.movesNum);
        };
    }

    public setFinish(fin: () => void) {
        this.finish = fin;
    }

    public getPoint(player: number): number {
        return this.board.count(p => p.value == player)
    }

    public current_turn() {
        return this.movesNum % 2 == 0 ? 1 : 2
    }

    public current_enemy_turn() {
        return this.movesNum % 2 == 0 ? 2 : 1
    }

    public async turn(): Promise<void> {
        if (this.board.isDone()) {
            if (this.userState != 0) { this.finish(); }
            return
        }
        const pl = this.players[this.current_turn()];
        if (pl == 'human') {
            console.log(` ===== Player(${this.movesNum % 2 + 1}) turn ===== `);
            this.scene.setInteractive(true);
        } else if (pl == 'Online') {
            if (this.userState != 0) {
                console.log(` ===== Player(${this.movesNum % 2 + 1}) turn ===== `);
                if (this.userState == this.current_turn()) {
                    this.scene.setInteractive(true);
                } else {
                    this.scene.setInteractive(false);
                }
            }
        } else {
            if (!pl.action) { await pl.loadModel(); }
            console.log(` ===== AI(${this.movesNum % 2 + 1}) turn ===== `);
            this.scene.setInteractive(false);
            if (pl.action) {
                // const pos = await pl.action(this.movesNum % 2 == 0 ? this.board : this.board.flip());
                // this.move(pos);
                pl.action(this.movesNum % 2 == 0 ? this.board : this.board.flip())
                    .then((pos) => { this.move(pos); });
            }
        }
    }

    public move(pos: Position): void {
        this.scene.setInteractive(false);
        if (this.board.isDone()) { return }
        const action: Piece<number> = { position: pos, value: this.current_turn() };
        this.setMovesNum(this.movesNum + 1);
        const [board, positionArray] = this.gameRecord.move(this.movesNum, action);
        this.board = board;
        this.scene.render(positionArray);
    }

    public jump(movesNum: number): void {
        if (movesNum < 0 || this.gameRecord.length - 1 < movesNum) { return }
        this.setMovesNum(movesNum)
        this.board = this.gameRecord.get(this.movesNum);
        this.scene.allRerender();
        this.turn();
    }

    public prev(): void {
        if (this.players[1] != 'human' && this.players[2] != 'human') { return }
        if (this.movesNum == 0) { return }
        const en = this.players[this.current_enemy_turn()];
        if (this.movesNum == 1 && en != 'human') { return }
        console.log('prev');

        this.jump(this.movesNum - (en == 'human' ? 1 : 2));
    }

    public next() {
        if (this.players[1] != 'human' && this.players[2] != 'human') { return }
        if (this.movesNum == this.gameRecord.length - 1) { return }
        const en = this.players[this.current_enemy_turn()];
        if (this.movesNum == this.gameRecord.length - 2 && en != 'human') { return }
        console.log('next');

        this.jump(this.movesNum + (en == 'human' ? 1 : 2));
    }

    public fastBackward(): void {
        if (this.players[1] != 'human' && this.players[2] != 'human') { return }
        if (this.movesNum == 0) { return }
        const en = this.players[this.current_enemy_turn()];
        if (this.movesNum == 1 && en != 'human') { return }
        console.log('cue');

        this.jump(this.players[1] == 'human' ? 0 : 1);
    }

    public fastForward(): void {
        if (this.players[1] != 'human' && this.players[2] != 'human') { return }
        if (this.movesNum == this.gameRecord.length - 1) { return }
        const en = this.players[this.current_enemy_turn()];
        if (this.movesNum == this.gameRecord.length - 2 && en != 'human') { return }
        console.log('fast forward');

        this.jump(this.players[(this.gameRecord.length - 1) % 2 == 0 ? 1 : 2] == 'human' ? this.gameRecord.length - 1 : this.gameRecord.length - 2);
    }

    public exportData(): string {
        return compress(this.gameRecord.exportData())
    }

    public importData(data: string, movesNum: number = 0) {
        this.gameRecord = this.gameRecord.importData(decompress(data));
        this.setMovesNum(movesNum);
        this.board = this.gameRecord.get(this.movesNum);
    }
}