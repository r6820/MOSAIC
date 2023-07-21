import { MosaicScene, Constants, Position, Piece } from "../";

export class Board<T> extends Array<Array<Array<T>>>{
    constructor(...pieces: T[][][]) {
        super(...pieces);
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

    public copy(): Board<number> {
        return this.mapPiece(p => Number(p.value));
    }

    public legalPieces(): Board<boolean> {
        const below = this.countBelow(v => v != 0);
        return this.mapPiece(
            piece => {
                const { position: a, value: v } = piece
                return v == 0 && (a.i == this.length - 1 || below.get(a) == 4)
            }
        )
    }

    public next(piece: Piece<number>): Board<number> {
        const board = this.copy();
        board.set(piece);
        console.log('place', piece);
        let fp: Piece<number>[] = [];
        let sp: Piece<number>[] = [];
        do {
            const lp = board.legalPieces();
            fp = board.countBelow(v => v == Constants.playerId.first).where(p => lp.get(p.position) && p.value >= 3);
            sp = board.countBelow(v => v == Constants.playerId.second).where(p => lp.get(p.position) && p.value >= 3);

            fp.forEach(({ position: pos }) => {
                const p = { position: pos, value: Constants.playerId.first };
                board.set(p);
                console.log('place', p);
            });
            sp.forEach(({ position: pos }) => {
                const p = { position: pos, value: Constants.playerId.second };
                board.set(p);
                console.log('place', p);

            });
        } while (fp.length + sp.length > 0)
        return board;
    }
}

export class MosaicGame {
    private scene: MosaicScene;
    private gameRecord: Board<number>[] = [];
    private player: number = Constants.playerId.first;
    public moves: number = 0;
    public board: Board<number>;
    public point: { f: number, s: number } = { f: 0, s: 0 };
    constructor(scene: MosaicScene) {
        this.scene = scene;
        this.board = this.initialBoard();
        this.gameRecord[this.moves] = this.board;
    }

    // private isDone(): boolean {
    //     return false
    // }

    private initialBoard() {
        const board = new Board<number>(
            ...new Array<number>(this.scene.size).fill(0).map((_, i) =>
                new Array<Array<number>>(i + 1).fill([0]).map(() =>
                    new Array<number>(i + 1).fill(0)
                )
            )
        );

        board.set({
            position: { i: this.scene.size - 1, j: (this.scene.size - 1) / 2, k: (this.scene.size - 1) / 2 },
            value: Constants.playerId.neutral
        })

        return board
    }

    public move(pos: Position) {
        this.moves += 1;
        this.player = this.moves % 2 == 1 ? Constants.playerId.first : Constants.playerId.second;

        this.board = this.board.next({ position: pos, value: this.player });
        this.gameRecord.splice(this.moves);
        this.gameRecord[this.moves] = this.board;

        this.point = {
            f: this.board.count(p => p.value == Constants.playerId.first),
            s: this.board.count(p => p.value == Constants.playerId.second)
        }

        this.scene.render();
    }

    public prev() {
        console.log('prev');
        if (this.moves == 0) { return }

        this.moves -= 1;
        this.player = this.moves % 2 == 1 ? Constants.playerId.first : Constants.playerId.second;

        this.board = this.gameRecord[this.moves];

        this.point = {
            f: this.board.count(p => p.value == Constants.playerId.first),
            s: this.board.count(p => p.value == Constants.playerId.second)
        }

        this.scene.render();
    }

    public next() {
        console.log('next');
        if (this.moves == this.gameRecord.length - 1) { return }

        this.moves += 1;
        this.player = this.moves % 2 == 1 ? Constants.playerId.first : Constants.playerId.second;

        this.board = this.gameRecord[this.moves];

        this.point = {
            f: this.board.count(p => p.value == Constants.playerId.first),
            s: this.board.count(p => p.value == Constants.playerId.second)
        }

        this.scene.render();
    }
}