import Phaser from "phaser";
import { Board, MosaicGame, Position, Tasks, boardLength, colors, defaultSize, delayFrames, height, holeRatio, indicatorWidth, offset, playerId, stoneRatio, width } from "@/phaser";
import placeSoundPath from '@/assets/place.mp3'


export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private prevPlace: Position[] = [];
    private indicator!: Phaser.GameObjects.Rectangle;
    private stoneBoard!: Board<{ stone: Stone, hole: Hole }>;
    private pointText!: Phaser.GameObjects.Text;
    private placeSound!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private updateTasks: Tasks = [];
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
        this.load.audio('place', [placeSoundPath])
    }

    create() {
        this.placeSound = this.sound.add('place');
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

    update() {
        if (this.updateTasks.length > 0) {
            if (this.updateTasks[0].n == 0) {
                this.updateTasks.shift()?.task();
            } else {
                this.updateTasks[0].n -= 1;
            }
        }
    }

    public addTask(task: () => void, n: number = 0) {
        this.updateTasks.push({ task, n })
    }

    public stoneRender(pos: Position, isPlace?: boolean) {
        const { stone, hole } = this.stoneBoard.get(pos);
        if (isPlace) {
            hole.render();
            stone.render(true);
            this.placeSound.play();
        } else {
            stone.render(false);
        }
    }

    public holeRender() {
        this.stoneBoard.forEachPiece(({ value: { hole } }) => {
            hole.render();
        });
    }

    public render(positionArray: Position[]) {
        this.board = this.mosaicGame.board;
        this.prevPlace.forEach((pos) => {
            this.stoneRender(pos);
        });
        this.prevPlace = positionArray;
        positionArray.forEach((pos, i) => {
            this.addTask(() => {
                this.stoneRender(pos, true);
            }, i == 0 ? 0 : delayFrames)
        })
        this.addTask(() => {
            this.holeRender();
            const val = this.mosaicGame.player;
            this.indicator.fillColor = colors[`stone${val}`];
            this.pointText.setText(`${this.mosaicGame.getPoint(playerId.first)}:${this.mosaicGame.getPoint(playerId.second)}`);
        });
        this.addTask(() => {
            this.mosaicGame.turn();
        });
    }

    public move(pos: Position) {
        this.addTask(() => { this.mosaicGame.move(pos) })
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
    private rim: Phaser.GameObjects.Arc;
    private mid: Phaser.GameObjects.Arc;
    constructor(scene: MosaicScene, pos: Position) {
        const { x, y } = scene.stonePosition(pos);
        super(scene, x, y);
        this.mosaicScene = scene;
        this.pos = pos;
        scene.add.existing(this);
        this.setDepth(scene.size - pos.i);
        this.rim = scene.add.circle(0, 0, scene.stoneSize / 2, colors.rim);
        this.mid = scene.add.circle(0, 0, scene.stoneSize / 2 * stoneRatio, colors.rim);
        this.add([this.rim, this.mid]);
    }
    public render(isPlace?: boolean) {
        const val = this.mosaicScene.board.get(this.pos);
        if (val == 0) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            if (isPlace) {
                this.rim.setStrokeStyle(3, colors[`stone${val}`], 1)
            } else {
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
        this.hole.setDepth(scene.size - pos.i);
        this.hole.on('pointerdown', async () => {
            console.log('click', this.hole.x, this.hole.y, pos);
            scene.move(pos);
        });
        this.hole.setDepth(scene.size * 2);
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