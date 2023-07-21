import Phaser from "phaser";
import { Board, MosaicGame } from '../utils/MosaicGame';
import { Constants } from '../utils/Constants';
import { Position } from "../utils/interfaces";

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private stoneBoard!: Board<{ stone: Stone, hole: Hole }>;
    private pointText!: Phaser.GameObjects.Text;
    public size: number = 7;
    public stoneSize: number = Constants.boardLength / this.size;

    constructor(size?: number) {
        super({ key: 'myscene', active: true });
        if (size != null) {
            this.size = size;
            this.stoneSize = Constants.boardLength / this.size;
        }
        this.mosaicGame = new MosaicGame(this);
    }

    preload() {
        this.load.setBaseURL("./public");
    }

    create() {
        this.add.rectangle(Constants.width / 2, Constants.height / 2, 700, 700, Constants.colors.frame)
            .setDepth(-1);
        this.stoneBoard = this.mosaicGame.board.mapPiece(({ position: pos }) => ({
            stone: new Stone(this, pos),
            hole: new Hole(this, pos)
        }));
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
        this.place();
    }

    update() { }

    public place() {
        this.stoneBoard.forEachPiece(({ value: { stone, hole } }) => { stone.place(); hole.place() })
        this.pointText.setText(`${this.mosaicGame.point.f}:${this.mosaicGame.point.s}`)
    }

    public stonePosition(action: Position) {
        const { i, j, k } = action;
        return {
            x: (j + (this.size - i) / 2) * this.stoneSize + Constants.offset.x,
            y: (k + (this.size - i) / 2) * this.stoneSize + Constants.offset.y
        }
    }
}


class Stone extends Phaser.GameObjects.Container{
    private pos: Position;
    private mosaicGame: MosaicGame;
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        super(scene, x, y);
        this.mosaicGame = scene.mosaicGame;
        this.pos = pos;
        scene.add.existing(this);
        this.setDepth(scene.size - pos.i);
        this.rim = scene.add.circle(0, 0, scene.stoneSize / 2, Constants.colors.rim);
        this.mid = scene.add.circle(0, 0, scene.stoneSize / 2 * Constants.stoneRatio, Constants.colors.rim);
        this.add([this.rim, this.mid]);
        this.place();
    }

    public place() {
        const val = this.mosaicGame.board.get(this.pos);
        if (val == 0) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            this.mid.fillColor = Constants.colors[`stone${val}`]
        }
    }
}

class Hole extends Phaser.GameObjects.Container{
    private pos: Position;
    private mosaicGame: MosaicGame;
    private hole: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        super(scene, x, y);
        this.mosaicGame = scene.mosaicGame;
        this.pos = pos;
        scene.add.existing(this);
        this.hole = scene.add.circle(x, y, scene.stoneSize / 2 * Constants.holeRatio, Constants.colors.hole);
        this.hole.on('pointerdown', () => {
            console.log('click', this.hole.x, this.hole.y, pos);
            scene.mosaicGame.move(pos);
        });
        this.hole.setDepth(scene.size*2);
        this.place();
    }
    public place() {
        const val = this.mosaicGame.board.legalPieces().get(this.pos);
        if (val) {
            this.hole.setInteractive();
        } else {
            this.hole.disableInteractive();
        }
        this.hole.setVisible(val);
    }

}