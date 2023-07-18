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

    public mapPiece(callbackfn: (value: number, i: number, j: number, k: number) => number): Board {
        return new Board(this.size, this.map(
            (v1, i) => v1.map(
                (v2, j) => v2.map(
                    (v3, k) => callbackfn(v3, i, j, k)
                )
            )
        ))
    }

    public forEachPiece(callbackfn: (value: number, i: number, j: number, k: number) => void): void {
        this.forEach(
            (v1, i) => v1.forEach(
                (v2, j) => v2.forEach(
                    (v3, k) => callbackfn(v3, i, j, k)
                )
            )
        )
    }

    public countBelow(conditionfn: (v: number) => number): Board {
        return this.mapPiece((_, i, j, k) =>
            i == this.size - 1 ? 0 :
                conditionfn(this[i + 1][j][k])
                + conditionfn(this[i + 1][j + 1][k])
                + conditionfn(this[i + 1][j][k + 1])
                + conditionfn(this[i + 1][j + 1][k + 1])
        )
    }

    public where(conditionfn: (value: number, i: number, j: number, k: number) => boolean): Position[] {
        const arr: Position[] = []
        this.forEachPiece((v, i, j, k) => {
            if (conditionfn(v, i, j, k)) {
                arr.unshift(new Position(i, j, k))
            }
        })
        return arr;
    }

    public getItem(action: Position): number {
        const { i, j, k } = action;
        return this[i][j][k];
    }

    public setItem(piece: Piece) {
        const { action, player } = piece
        const { i, j, k } = action;
        this[i][j][k] = player;
    }

    public copy(): Board {
        return this.mapPiece(v => v);
    }

    public legalPieces(): Board {
        const below = this.countBelow(v => Number(v != 0));
        return this.mapPiece(
            (v, i, j, k) => Number(v == 0 && (i == this.size - 1 || below[i][j][k] == 4))
        )
    }

    public getPosition(): Position[] {
        return this.where(v => v != 0);
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
        this.moves += 1;
    }

    // private isDone(): boolean {
    //     return false
    // }

    public next(action: Position) {
        this.board = this.board.copy();
        this.gameRecord[this.moves] = this.board;
        this.board.setItem(new Piece(action, this.player));
        let fp: Position[] = [];
        let sp: Position[] = [];
        do {
            const lp = this.board.legalPieces();
            fp = this.board.countBelow(v => Number(v == Constant.playerId.first)).where((v, i, j, k) => lp[i][j][k] == 1 && v >= 3);
            sp = this.board.countBelow(v => Number(v == Constant.playerId.second)).where((v, i, j, k) => lp[i][j][k] == 1 && v >= 3);
            console.log(fp, sp);

            fp.forEach(p => { this.board.setItem(new Piece(p, Constant.playerId.first)) });
            sp.forEach(p => { this.board.setItem(new Piece(p, Constant.playerId.second)) });
        } while (fp.length + sp.length > 0)

        this.point = {
            f: this.board.where(v => v == Constant.playerId.first).length,
            s: this.board.where(v => v == Constant.playerId.second).length
        }

        this.scene.destroyAll();
        this.scene.place();
        this.moves += 1;
        this.player = this.moves % 2 == 0 ? Constant.playerId.second : Constant.playerId.first;
    }
}