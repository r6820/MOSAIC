import { MosaicScene } from "./MosaicScene";
import { Position, Piece, Constant } from './Constant';

export class Board<T> extends Array<Array<Array<T>>>{
    constructor(...pieces: T[][][]) {
        super(...pieces);
    }

    public mapPiece<U>(callbackfn: (piece: Piece<T>) => U): Board<U> {
        return new Board(...this.map(
            (v1, i) => v1.map(
                (v2, j) => v2.map(
                    (v3, k) => callbackfn(new Piece(new Position(i, j, k), v3))
                )
            )
        ))
    }

    public forEachPiece(callbackfn: (piece: Piece<T>) => void): void {
        this.forEach(
            (v1, i) => v1.forEach(
                (v2, j) => v2.forEach(
                    (v3, k) => callbackfn(new Piece(new Position(i, j, k), v3))
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
            return i == Constant.size - 1 ? 0 :
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
                arr.unshift(Piece)
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
        return this.mapPiece(p => p.value);
    }

    public legalPieces(): Board<boolean> {
        const below = this.countBelow(v => v != 0);
        return this.mapPiece(
            piece => {
                const { position: a, value: v } = piece
                return v == 0 && (a.i == Constant.size - 1 || below.get(a) == 4)
            }
        )
    }

    public getPieceArray(): Piece<T>[] {
        return this.where(p => p.value != 0);
    }
}

export class MosaicGame {
    private scene: MosaicScene;
    private gameRecord: Board<number>[] = [];
    private player: number = Constant.playerId.first;
    private moves: number = 0;
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
        const board = new Array<number>(Constant.size).fill(0).map((_, i) =>
            new Array<number[]>(i + 1).fill([0]).map(() =>
                new Array<number>(i + 1).fill(0)
            )
        );
        // board[size - 1][(size - 1) / 2][(size - 1) / 2]
        //     = Constant.playerId.neutral;
        return new Board<number>(...board)
    }

    public next(action: Position) {
        this.board = this.board.copy();
        this.moves += 1;
        this.gameRecord[this.moves] = this.board;
        this.board.set(new Piece(action, this.player));
        let fp: Piece<number>[] = [];
        let sp: Piece<number>[] = [];
        do {
            const lp = this.board.legalPieces();
            fp = this.board.countBelow(v => v == Constant.playerId.first).where(p => lp.get(p.position) && p.value >= 3);
            sp = this.board.countBelow(v => v == Constant.playerId.second).where(p => lp.get(p.position) && p.value >= 3);
            console.log(fp, sp);

            fp.forEach(({ position: pos }) => { this.board.set(new Piece(pos, Constant.playerId.first)) });
            sp.forEach(({ position: pos }) => { this.board.set(new Piece(pos, Constant.playerId.second)) });
        } while (fp.length + sp.length > 0)

        this.point = {
            f: this.board.count(p => p.value == Constant.playerId.first),
            s: this.board.count(p => p.value == Constant.playerId.second)
        }

        this.scene.place();
        this.player = this.moves % 2 == 0 ? Constant.playerId.second : Constant.playerId.first;
        console.log('Game Record Length:', this.gameRecord.length);
        console.log('Moves:', this.moves);

    }
}