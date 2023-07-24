import Phaser from "phaser";
import { Board, MosaicGame, phaserConstants as Constants, Position } from "../";
import { sleep } from "../../common";

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private stoneBoard!: Board<{ stone: Stone, hole: Hole }>;
    private pointText!: Phaser.GameObjects.Text;
    public size: number = Constants.defaultSize;
    public stoneSize: number = Constants.boardLength / this.size;
    public board: Board<number>;

    constructor(size?: number) {
        super({ key: 'mosaicScene', active: true });
        if (size != null) {
            this.size = size;
            this.stoneSize = Constants.boardLength / this.size;
        }
        this.mosaicGame = new MosaicGame(this);
        this.board = this.mosaicGame.board;
    }

    preload() {
        // this.load.setBaseURL("./public");
    }

    create() {
        this.add.rectangle(Constants.width / 2, Constants.height / 2, 700, 700, Constants.colors.frame)
            .setDepth(-1);
        this.stoneBoard = this.mosaicGame.board.mapPiece(({ position: pos }) => ({
            stone: new Stone(this, pos),
            hole: new Hole(this, pos)
        }));
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
        this.render();
    }

    public async render(boardArray?: Board<number>[]) {
        this.setInteractive(false);
        this.updateBoard(boardArray?.shift() || this.mosaicGame.board);
        for (const board of (boardArray || [])) {
            await sleep(Constants.delayTime);
            this.updateBoard(board);
        }
        this.setInteractive(true);
    }

    private updateBoard(board: Board<number>) {
        this.board = board;
        this.stoneBoard.forEachPiece(({ value: { stone, hole } }) => { stone.render(); hole.render() });
        this.pointText.setText(`${this.mosaicGame.getPoint(Constants.playerId.first)}:${this.mosaicGame.getPoint(Constants.playerId.second)}`);
    }

    public stonePosition(action: Position) {
        const { i, j, k } = action;
        return {
            x: (j + (this.size - i) / 2) * this.stoneSize + Constants.offset.x,
            y: (k + (this.size - i) / 2) * this.stoneSize + Constants.offset.y
        }
    }

    public setInteractive(value: boolean) {
        this.stoneBoard.forEachPiece(({ value: { hole } }) => {
            hole.setInteractive(value);
        })
    }
}


class Stone extends Phaser.GameObjects.Container {
    private pos: Position;
    private mosaicScene: MosaicScene;
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        super(scene, x, y);
        this.mosaicScene = scene;
        this.pos = pos;
        scene.add.existing(this);
        this.setDepth(scene.size - pos.i);
        this.rim = scene.add.circle(0, 0, scene.stoneSize / 2, Constants.colors.rim);
        this.mid = scene.add.circle(0, 0, scene.stoneSize / 2 * Constants.stoneRatio, Constants.colors.rim);
        this.add([this.rim, this.mid]);
        this.render();
    }
    public render() {
        const val = this.mosaicScene.board.get(this.pos);
        if (val == 0) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            this.mid.fillColor = Constants.colors[`stone${val}`]
        }
    }
}

class Hole {
    private pos: Position;
    private mosaicScene: MosaicScene;
    private hole: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        this.mosaicScene = scene;
        this.pos = pos;
        this.hole = scene.add.circle(x, y, scene.stoneSize / 2 * Constants.holeRatio, Constants.colors.hole);
        this.hole.on('pointerdown', () => {
            console.log('click', this.hole.x, this.hole.y, pos);
            scene.mosaicGame.move(pos);
        });
        this.hole.setDepth(scene.size * 2);
        this.render();
    }

    public render() {
        const value = this.mosaicScene.board.legalPieces().get(this.pos);
        this.hole.setVisible(value);
    }

    public setInteractive(value: boolean) {
        if (value && this.mosaicScene.board.legalPieces().get(this.pos)) {
            this.hole.setInteractive();
        } else {
            this.hole.disableInteractive();
        }
    }
}