import Phaser from "phaser";
import { Board,MosaicGame } from './game';
import { Stone, Constant, Hole } from './Constant';

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private stoneList: Board<Stone>;
    private holeList: Board<Hole>;
    private pointText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'myscene', active: true });
        this.mosaicGame = new MosaicGame(this);
        this.stoneList = this.mosaicGame.board.mapPiece(({ position: pos }) => new Stone(this, pos));
        this.holeList = this.mosaicGame.board.mapPiece(({ position: pos }) => new Hole(this, pos));
    }

    preload() {
        this.load.setBaseURL("./public");
    }

    create() {
        this.cameras.main.setBackgroundColor(Constant.colors.bg)
        this.add.rectangle(Constant.width / 2, Constant.height / 2, 700, 700, Constant.colors.frame);
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
        this.place();
    }

    update() {}

    public place() {
        this.stoneList.forEachPiece(({value:stone}) => { stone.place() })
        this.holeList.forEachPiece(({value:hole}) => { hole.place() })
        this.pointText.setText(`${this.mosaicGame.point.f}:${this.mosaicGame.point.s}`)
    }
}