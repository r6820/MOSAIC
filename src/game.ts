import { MosaicScene } from "./scenes/MosaicScene";

export class Action {
    i: number; j: number; k: number;
    constructor(i: number, j: number, k: number) {
        this.i = i;
        this.j = j;
        this.k = k;
    }
}

export class Pieces extends Array<Array<Array<number>>>{
    private size: number;
    constructor(size: number, pieces?: number[][][]) {
        super();
        this.size = size
        if (pieces) {
            this.push(...pieces);
        } else {
            this.push(...new Array<number>(this.size).fill(0).map((_, i) =>
                new Array<number[]>(i + 1).fill([0]).map(() => new Array<number>(i + 1).fill(0)))
            );
            this[this.size - 1][(this.size - 1) / 2][(this.size - 1) / 2] = 2;
        }
    }

    public piecesMap(callbackfn: (value: number, i: number, j: number, k: number) => number): Pieces {
        return new Pieces(this.size, this.map(
            (v1, i) => v1.map(
                (v2, j) => v2.map(
                    (v3, k) => callbackfn(v3, i, j, k)
                )
            )
        ))
    }

    public piecesForEach(callbackfn: (value: number, i: number, j: number, k: number) => void): void {
        this.forEach(
            (v1, i) => v1.forEach(
                (v2, j) => v2.forEach(
                    (v3, k) => callbackfn(v3, i, j, k)
                )
            )
        )
    }


    public countBelow(conditionfn: (v: number) => number): Pieces {
        return this.piecesMap((_, i, j, k) =>
            i == this.size - 1 ? 0 :
                conditionfn(this[i + 1][j][k])
                + conditionfn(this[i + 1][j + 1][k])
                + conditionfn(this[i + 1][j][k + 1])
                + conditionfn(this[i + 1][j + 1][k + 1])
        )
    }

    public where(conditionfn: (value: number, i: number, j: number, k: number) => boolean): Action[] {
        const arr: Action[] = []
        this.piecesForEach((v, i, j, k) => {
            if (conditionfn(v, i, j, k)) {
                arr.push(new Action(i, j, k))
            }
        })
        return arr
    }

    public getItem(action: Action): number {
        const { i, j, k } = action;
        return this[i][j][k]
    }

    public setItem(action: Action, value: number): void {
        const { i, j, k } = action;
        this[i][j][k] = value;
    }

}

export class Game {
    private scene: MosaicScene;
    private size: number;
    public pieces: Pieces;
    public player: number = 1;
    private point: { f: number, s: number } = { f: 0, s: 0 };
    constructor(scene: MosaicScene) {
        this.scene = scene;
        this.size = scene.size;
        this.pieces = new Pieces(this.size);
        this.pieces.piecesForEach((v, i, j, k) => {
            if (v == 0) {
                if (this.legalPieces()[i][j][k] == 1) {
                    this.scene.placeable.push(new Action(i, j, k,))
                }
            } else if (v == 2) {
                this.scene.place.push({ action: new Action(i, j, k,), player: 2 });
            }
        })
    }

    // private isDone(): boolean {
    //     return false
    // }

    public legalPieces(): Pieces {
        const below = this.pieces.countBelow(v => Number(v != 0));
        return this.pieces.piecesMap(
            (v, i, j, k) => Number(i == this.size - 1 || (v == 0 && below[i][j][k] == 4))
        )
    }

    public legalActions(): Action[] {
        return this.legalPieces().where(v => v == 1);
    }

    public next(action: Action): void {
        const _legalPieces = this.legalPieces();
        this.placeStone(action, this.player);
        let fp: Action[] = [];
        let sp: Action[] = [];
        do {
            const lp = this.legalPieces();
            fp = this.pieces.countBelow(v => Number(v == 1)).where((v, i, j, k) => lp[i][j][k] == 1 && v >= 3);
            sp = this.pieces.countBelow(v => Number(v == -1)).where((v, i, j, k) => lp[i][j][k] == 1 && v >= 3);
            console.log(fp, sp);

            fp.forEach(a => this.placeStone(a, 1))
            sp.forEach(a => this.placeStone(a, -1))
        } while (fp.length + sp.length > 0)

        const legalPieces = this.legalPieces();
        legalPieces.piecesForEach((v, i, j, k) => {
            if (v == 1 && _legalPieces[i][j][k] == 0) {
                this.scene.placeable.push(new Action(i, j, k))
            }
        });
        this.player *= -1;
    }

    private placeStone(action: Action, player: number) {
        console.log('place', action);
        this.pieces.setItem(action, player);
        this.scene.place.push({ action: action, player: player });
        if (player==1){
            this.point.f += 1;
        } else if (player==-1){
            this.point.s += 1;
        }
        this.scene.pointText.setText(`${this.point.f}:${this.point.s}`);
    }
}