import Phaser from "phaser";
import { Position, Piece, MosaicGame } from './game';

class xy<T extends number> {
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

export class MosaicScene extends Phaser.Scene {
    public size: number = 7;
    private gameLength: xy<number> = new xy(800, 800);
    private offset1: xy<number> = new xy(50, 50);
    private offset2: xy<number> = new xy(50, 50);

    private sumOffset: xy<number> = this.offset1.add(this.offset2)
    private boardLength: xy<number> = this.gameLength.sub(this.sumOffset)
    public colors: { [color: string]: number } = {
        'bg': 0x229944,
        'frame': 0xdeb887,
        'hole': 0x444444,
        'rim': 0xffffff,
        'stone2': 0xaaaaaa,
        'stone1': 0xaa22aa,
        'stone-1': 0x22aaaa,
    };
    public stonePosition(action: Position) {
        const { i, j, k } = action;
        return this.offset1.map(
            (v1, v2, v3) => v1 + v2 / this.size * (v3 + (this.size - i) / 2),
            this.boardLength, new xy(j, k)
        )
    }
    public mosaicGame: MosaicGame;
    public pointText!: Phaser.GameObjects.Text;
    private placeList: Piece[] = [];
    private placeableList: Position[] = [];
    public place(...items: Piece[]) { this.placeList.push(...items) }
    public placeable(...items: Position[]) { this.placeableList.push(...items) }
    private canvas!: HTMLCanvasElement;

    constructor() {
        super({ key: 'myscene', active: true });
        this.mosaicGame = new MosaicGame(this);
    }

    preload() {
        this.canvas = this.sys.game.canvas;
        this.load.setBaseURL("./public");

        //画像の読み込み
        // this.load.image("ball", "assets/images/ball.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(this.colors['bg'])

        this.add.rectangle(this.gameLength.x / 2, this.gameLength.y / 2, 700, 700, this.colors['frame']);
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
    }

    update() {
        this.placeList.forEach(v => {
            const { action, player } = v
            console.log(action);
            this.stoneCircle(action, player);
        })
        this.placeList = [];
        this.placeableList.forEach(action => {
            console.log(action);
            this.stoneHole(action);
        })
        this.placeableList = [];
    }

    private stoneHole(action: Position) {
        const { x, y } = this.stonePosition(action);
        const hole = this.add.circle(x, y, 18, this.colors['hole']).setInteractive();
        hole.on('pointerdown', () => {
            this.mosaicGame.next(action);
            hole.destroy();
            console.log('click', hole.x, hole.y);
        });
    }

    private stoneCircle(action: Position, player: number) {
        const { x, y } = this.stonePosition(action);
        const color: string = `stone${player}`
        console.log(x, y, color);
        this.add.circle(x, y, 50, this.colors['rim']);
        this.add.circle(x, y, 45, this.colors[color]);
    }
}