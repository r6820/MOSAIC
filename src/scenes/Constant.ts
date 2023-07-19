import { MosaicScene } from "./MosaicScene";
import { MosaicGame } from "./game";

export class xy<T extends number> {
    public x: T;
    public y: T;
    constructor(x: T, y: T) {
        this.x = x;
        this.y = y;
    }
    public map<U extends number>(f: (...o: T[]) => U, ...others: xy<T>[]): xy<U> {
        return new xy<U>(
            f(this.x, ...others.map(obj => obj.x)),
            f(this.y, ...others.map(obj => obj.y))
        );
    }
    public add(...other: xy<T>[]): xy<number> {
        return this.map((...o) => o.reduce((a, b) => a + b as T), ...other)
    }
    public sub(other: xy<T>): xy<number> {
        return this.map((...o) => o.reduce((a, b) => a - b as T), other)
    }
}

export class Stone {
    private pos: Position;
    private mosaicGame: MosaicGame;
    private container: Phaser.GameObjects.Container;
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        this.mosaicGame = scene.mosaicGame;
        this.pos = pos;
        const { x, y } = Constant.stonePosition(pos);
        this.container = scene.add.container(x, y);
        this.rim = scene.add.circle(0, 0, 50, Constant.colors.rim);
        this.mid = scene.add.circle(0, 0, 45, Constant.colors.rim);
        this.container.add([this.rim, this.mid]);
        this.place()
    }

    public place() {
        const val = this.mosaicGame.board.get(this.pos);
        if (val == Constant.playerId.brank) {
            this.container.setVisible(false);
        } else {
            this.container.setVisible(true);
            this.mid.fillColor = Constant.colors[`stone${val}`]
        }
    }
}

export class Hole {
    private pos: Position;
    private mosaicGame: MosaicGame;
    private hole: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        this.mosaicGame = scene.mosaicGame;
        this.pos = pos;
        const { x, y } = Constant.stonePosition(pos);
        this.hole = scene.add.circle(x, y, 18, Constant.colors.hole).setInteractive();
        this.hole.on('pointerdown', () => {
            scene.mosaicGame.next(pos);
            this.hole.setVisible(false);
            console.log('click', this.hole.x, this.hole.y);
        });
        this.place()
    }
    public place() {
        const val = this.mosaicGame.board.legalPieces().get(this.pos);
        this.hole.setVisible(val);
    }

}

export class Position {
    i: number; j: number; k: number;
    constructor(i: number, j: number, k: number) {
        this.i = i;
        this.j = j;
        this.k = k;
    }
}

export class Piece<T> {
    position: Position; value: T
    constructor(action: Position, value: T) {
        this.position = action;
        this.value = value;
    }
}

export class Constant {
    static size: number = 7;
    static offset1: xy<number> = new xy(50, 50);

    static width = 800;
    static height = 800;

    static boardLength: number = 700;
    static boardSize: xy<number> = new xy(this.boardLength, this.boardLength);

    static playerId: Record<string, number> = { first: 1, second: -1, neutral: 200, brank: 0 }
    static changePlayer(p: number) {
        if (p == this.playerId.first) {
            return this.playerId.second;
        }
        if (p == this.playerId.second) {
            return this.playerId.first;
        }
        return p;
    }
    static colors: Record<string, number> = {
        'bg': 0x229944,
        'frame': 0xdeb887,
        'hole': 0x444444,
        'rim': 0xffffff,
        [`stone${this.playerId.neutral}`]: 0xaaaaaa,
        [`stone${this.playerId.first}`]: 0xaa22aa,
        [`stone${this.playerId.second}`]: 0x22aaaa,
        [`stone${this.playerId.brank}`]: 0xeeeeee,
        // 'stone2': 0xaaaaaa,
        // 'stone1': 0xaa22aa,
        // 'stone-1': 0x22aaaa,
    }

    static stonePosition(action: Position) {
        const { i, j, k } = action;
        return new xy(j, k).map(
            (v1, v2, v3) => (v1 + (Constant.size - i) / 2) * v2 / Constant.size + v3,
            Constant.boardSize, Constant.offset1
        )
    }
}