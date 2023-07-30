import Phaser from "phaser";
import { Board, MosaicGame, Piece, Position, boardLength, colors, defaultSize, delayTime, height, holeRatio, indicatorWidth, offset, playerId, stoneRatio, width } from "../";
import { sleep } from "../../common";

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private prevPlace: Piece<number>[] = [];
    private indicator!: Phaser.GameObjects.Rectangle;
    private stoneBoard!: Board<{ stone: Stone, hole: Hole }>;
    private pointText!: Phaser.GameObjects.Text;
    public size: number = defaultSize;
    public stoneSize: number = boardLength / this.size;
    public board: Board<number>;
    public isRendering: boolean = false;

    constructor(mosaicGame: MosaicGame) {
        super({ key: 'mosaicScene', active: true });
        this.mosaicGame = mosaicGame;
        this.size = mosaicGame.size;
        this.stoneSize = boardLength / this.size;
        this.board = this.mosaicGame.board;
    }

    preload() {
        // this.load.setBaseURL("./public");
    }

    create() {
        this.add.rectangle(width / 2, height / 2, boardLength, boardLength, colors.frame).setDepth(-1);
        this.indicator = this.add.rectangle(width / 2, height / 2, boardLength + indicatorWidth, boardLength + indicatorWidth, colors.bg).setDepth(-2);
        this.stoneBoard = this.mosaicGame.board.mapPiece(({ position: pos }) => ({
            stone: new Stone(this, pos),
            hole: new Hole(this, pos)
        }));
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
        this.allRerender();
        this.mosaicGame.turn();
    }

    public async render(pieceArray?: Piece<number>[]) {
        console.log('render');
        this.board = this.mosaicGame.board;
        for (const { position } of this.prevPlace) {
            const { stone, hole } = this.stoneBoard.get(position);
            stone.render(); hole.render();
        }
        this.prevPlace = pieceArray || [];
        for (const { position } of this.prevPlace) {
            const { stone, hole } = this.stoneBoard.get(position);
            stone.render(true); hole.render();
            await sleep(delayTime);
        }
        const val = this.mosaicGame.player;
        this.indicator.fillColor = colors[`stone${val}`];
        this.pointText.setText(`${this.mosaicGame.getPoint(playerId.first)}:${this.mosaicGame.getPoint(playerId.second)}`);
        // this.mosaicGame.turn();
    }

    public allRerender() {
        this.board = this.mosaicGame.board;
        this.prevPlace = [];
        this.stoneBoard.forEachPiece(({ value: { stone, hole } }) => {
            stone.render(); hole.render()
        });
        const val = this.mosaicGame.player;
        this.indicator.fillColor = colors[`stone${val}`];
        this.pointText.setText(`${this.mosaicGame.getPoint(playerId.first)}:${this.mosaicGame.getPoint(playerId.second)}`);
        // this.mosaicGame.turn();
    }

    public stonePosition(action: Position) {
        const { i, j, k } = action;
        return {
            x: (j + (this.size - i) / 2) * this.stoneSize + offset.x,
            y: (k + (this.size - i) / 2) * this.stoneSize + offset.y
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
    private defaultDepth: number;
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        super(scene, x, y);
        this.mosaicScene = scene;
        this.pos = pos;
        scene.add.existing(this);
        this.defaultDepth = scene.size - pos.i
        this.setDepth(this.defaultDepth);
        this.rim = scene.add.circle(0, 0, scene.stoneSize / 2, colors.rim);
        this.mid = scene.add.circle(0, 0, scene.stoneSize / 2 * stoneRatio, colors.rim);
        this.add([this.rim, this.mid]);
        // this.render();
    }
    public render(isPlace?: boolean) {
        const val = this.mosaicScene.board.get(this.pos);
        if (val == 0) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            if (isPlace) {
                this.setDepth(this.depth + 1);
                this.rim.setStrokeStyle(3, colors[`stone${val}`], 1)
            } else {
                this.setDepth(this.defaultDepth);
                this.rim.setStrokeStyle()
            }
            this.mid.fillColor = colors[`stone${val}`];
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
        this.hole = scene.add.circle(x, y, scene.stoneSize / 2 * holeRatio, colors.innactive);
        this.hole.on('pointerdown', async () => {
            console.log('click', this.hole.x, this.hole.y, pos);
            await scene.mosaicGame.move(pos);
        });
        this.hole.setDepth(scene.size * 2);
        // this.render();
    }

    public render() {
        const value = this.mosaicScene.board.legalPieces().get(this.pos);
        this.hole.setVisible(value);
    }

    public setInteractive(value: boolean) {
        if (value && this.mosaicScene.board.legalPieces().get(this.pos)) {
            this.hole.setInteractive();
            this.hole.fillColor = colors.hole;
        } else {
            this.hole.disableInteractive();
            this.hole.fillColor = colors.innactive;
        }
    }
}