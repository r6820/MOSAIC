import Phaser from "phaser";
import { MosaicGame } from './game';
import { Stone, Position, Piece, Constant, Hole } from './Constant';

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private stoneList: Stone[] = [];
    private holeList: Hole[] = [];
    public pointText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'myscene', active: true });
        this.mosaicGame = new MosaicGame(this);
    }

    preload() {
        this.load.setBaseURL("./public");

        //画像の読み込み
        // this.load.image("ball", "assets/images/ball.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(Constant.colors.bg)
        this.add.rectangle(Constant.width / 2, Constant.height / 2, 700, 700, Constant.colors.frame);
        this.pointText = this.add.text(0, 0, '0:0', { fontSize: '48px', fontFamily: 'Arial' });
        this.preplace();
        this.place();
    }

    update() {

    }

    private preplace() {
        this.stoneList = this.mosaicGame.board.where(() => true).map(({ position: pos }) => new Stone(this, pos));
        this.holeList = this.mosaicGame.board.where(() => true).map(({ position: pos }) => new Hole(this, pos));
    }

    public place() {
        this.stoneList.forEach(stone => { stone.place() })
        this.holeList.forEach(hole => { hole.place() })
        this.pointText.setText(`${this.mosaicGame.point.f}:${this.mosaicGame.point.s}`)
    }
}