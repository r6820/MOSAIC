import { MosaicScene } from "./MosaicScene";

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
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, piece: Piece) {
        const { action, player } = piece
        const { x, y } = Constant.stonePosition(action);
        const color: string = `stone${player}`
        console.log(x, y, color);
        this.rim = scene.add.circle(x, y, 50, Constant.colors.rim);
        this.mid = scene.add.circle(x, y, 45, Constant.colors[color]);

    }
    public destroy() {
        console.log('destroy', this.rim, this.mid);
        this.rim.destroy(); this.mid.destroy();
    }
}

export class Hole {
    private hole: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, action: Position) {
        const { x, y } = Constant.stonePosition(action);
        this.hole = scene.add.circle(x, y, 18, Constant.colors.hole).setInteractive();
        this.hole.on('pointerdown', () => {
            scene.mosaicGame.next(action);
            this.hole.destroy();
            console.log('click', this.hole.x, this.hole.y);
        });
    }
    public destroy() { this.hole.destroy(); }

}

export class Position {
    i: number; j: number; k: number;
    constructor(i: number, j: number, k: number) {
        this.i = i;
        this.j = j;
        this.k = k;
    }
}

export class Piece {
    action: Position; player: number
    constructor(action: Position, player: number) {
        this.action = action;
        this.player = player;
    }
}

export class Constant {
    static size: number = 7;
    static offset1: xy<number> = new xy(50, 50);

    static width = 800;
    static height = 800;

    static boardLength: number = 700;
    static boardSize: xy<number> = new xy(this.boardLength, this.boardLength);

    static playerId: Record<string, number> = { first: 1, second: -1, neutral: 200 }
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