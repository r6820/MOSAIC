import Phaser from "phaser";
import { Action, Game } from '../game';

interface xy<T> {
    x: T,
    y: T,
}

function objectMap<T, U>
    (f: (...o: T[]) => U, ...objs: xy<T>[]): xy<U> {
    return { x: f(...objs.map(obj => obj.x)), y: f(...objs.map(obj => obj.y)) }
}

export class MosaicScene extends Phaser.Scene {
    public size: number = 7;
    private gameLength: xy<number> = { x: 800, y: 800 };
    private offset1: xy<number> = { x: 50, y: 50 };
    private offset2: xy<number> = { x: 50, y: 50 };

    private sumOffset: xy<number> = objectMap((a, b) => a + b, this.offset1, this.offset2)
    private boardLength: xy<number> = objectMap((a, b) => a - b, this.gameLength, this.sumOffset)
    public colors: { [color: string]: number } = {
        'bg': 0x229944,
        'frame': 0xdeb887,
        'hole': 0x444444,
        'rim': 0xffffff,
        'stone2': 0xaaaaaa,
        'stone1': 0xaa22aa,
        'stone-1': 0x22aaaa,
    };
    public stonePosition(action: Action) {
        const { i, j, k } = action;
        return objectMap(
            (v1, v2, v3) => v1 + v2 / this.size * (v3 + (this.size - i) / 2),
            this.offset1, this.boardLength, { x: j, y: k }
        );
    }
    public mosaicGame: Game;
    public place: { action: Action, player: number }[] = [];
    public placeable: Action[] = [];

    constructor() {
        super({ key: 'myscene', active: true });
        this.mosaicGame = new Game(this)
    }

    preload() {
        this.load.setBaseURL("./public");

        //画像の読み込み
        // this.load.image("ball", "assets/images/ball.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(this.colors['bg'])

        this.add.rectangle(this.gameLength.x / 2, this.gameLength.y / 2, 700, 700, this.colors['frame']);
    }

    update() {
        this.place.forEach(v => {
            const { action, player } = v
            console.log(action);
            this.stoneCircle(action, player);
        })
        this.place = [];
        this.placeable.forEach(action => {
            console.log(action);
            this.stoneHole(action);
        })
        this.placeable = [];
    }

    private stoneHole(action: Action) {
        const { x, y } = this.stonePosition(action);
        const hole = this.add.circle(x, y, 18, this.colors['hole']).setInteractive();
        hole.on('pointerdown', () => {
            this.mosaicGame.next(action);
            hole.destroy();
            console.log('click', hole.x, hole.y);
        });
    }

    private stoneCircle(action: Action, player: number) {
        const { x, y } = this.stonePosition(action);
        const color: string = `stone${player}`
        console.log(x, y, color);
        this.add.circle(x, y, 50, this.colors['rim']);
        this.add.circle(x, y, 45, this.colors[color]);
    }

}