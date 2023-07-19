import { MosaicScene } from "./MosaicScene";
import { Position, Piece, Constant } from './Constant';

export class Board extends Array<Array<Array<number>>>{
    private size: number = 7;
    constructor(size?: number, pieces?: number[][][]) {
        super();
        if (pieces) {
            this.size = pieces.length
            this.push(...pieces);
        } else {
            if (size) { this.size = size; }
            this.push(...new Array<number>(this.size).fill(0).map((_, i) =>
                new Array<number[]>(i + 1).fill([0]).map(() => new Array<number>(i + 1).fill(0)))
            );
            this[this.size - 1][(this.size - 1) / 2][(this.size - 1) / 2]
                = Constant.playerId.neutral;
        }
    }

    public mapPiece(callbackfn: (piece: Piece) => number): Board {
        return new Board(this.size, this.map(
            (v1, i) => v1.map(
                (v2, j) => v2.map(
                    (v3, k) => callbackfn(new Piece(new Position(i, j, k), v3))
                )
            )
        ))
    }

    public forEachPiece(callbackfn: (piece: Piece) => void): void {
        this.forEach(
            (v1, i) => v1.forEach(
                (v2, j) => v2.forEach(
                    (v3, k) => callbackfn(new Piece(new Position(i, j, k), v3))
                )
            )
        )
    }

    public count(conditionfn: (piece: Piece) => boolean): number {
        return this.where(conditionfn).length
    }

    public countBelow(conditionfn: (v: number) => number): Board {
        return this.mapPiece(piece => {
            const { position: { i, j, k } } = piece;
            return i == this.size - 1 ? 0 :
                conditionfn(this[i + 1][j][k])
                + conditionfn(this[i + 1][j + 1][k])
                + conditionfn(this[i + 1][j][k + 1])
                + conditionfn(this[i + 1][j + 1][k + 1])
        }
        )
    }

    public where(conditionfn: (piece: Piece) => boolean): Piece[] {
        const arr: Piece[] = [];
        this.forEachPiece(Piece => {
            if (conditionfn(Piece)) {
                arr.unshift(Piece)
            }
        })
        return arr;
    }

    public get(position: Position): number {
        const { i, j, k } = position;
        return this[i][j][k];
    }

    public set(piece: Piece) {
        const { position: { i, j, k }, value: value } = piece
        this[i][j][k] = value;
    }

    public copy(): Board {
        return this.mapPiece(p => p.value);
    }

    public legalPieces(): Board {
        const below = this.countBelow(v => Number(v != 0));
        return this.mapPiece(
            piece => {
                const { position: a, value: v } = piece
                return Number(v == 0 && (a.i == this.size - 1 || below.get(a) == 4))
            }
        )
    }

    public getPieceArray(): Piece[] {
        return this.where(p => p.value != 0);
    }
}

export class MosaicGame {
    private scene: MosaicScene;
    private size: number;
    private gameRecord: Board[] = [];
    public board: Board;
    public player: number = Constant.playerId.first;
    public point: { f: number, s: number } = { f: 0, s: 0 };
    private moves: number = 0;
    constructor(scene: MosaicScene) {
        this.scene = scene;
        this.size = Constant.size;
        this.board = new Board(this.size);
        this.gameRecord[this.moves] = this.board;
    }

    // private isDone(): boolean {
    //     return false
    // }

    public next(action: Position) {
        this.board = this.board.copy();
        this.moves += 1;
        this.gameRecord[this.moves] = this.board;
        this.board.set(new Piece(action, this.player));
        let fp: Piece[] = [];
        let sp: Piece[] = [];
        do {
            const lp = this.board.legalPieces();
            fp = this.board.countBelow(v => Number(v == Constant.playerId.first)).where(p => lp.get(p.position) == 1 && p.value >= 3);
            sp = this.board.countBelow(v => Number(v == Constant.playerId.second)).where(p => lp.get(p.position) == 1 && p.value >= 3);
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
    }
}