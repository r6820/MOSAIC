import Phaser from "phaser";
import { MosaicGame } from './game';
import { Stone, Position, Piece, Constant, Hole } from './Constant';

export class MosaicScene extends Phaser.Scene {
    public mosaicGame: MosaicGame;
    private placeList: Piece[] = [];
    private placeableList: Position[] = [];
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
        this.place();
    }

    update() {
        this.placeList.forEach(v => {
            this.stoneList.push(new Stone(this, v));
        });
        this.placeList.splice(0);
        this.placeableList.forEach(action => {
            this.holeList.push(new Hole(this, action))
        });
        this.placeableList.splice(0);
    }

    public place() {
        this.placeList = this.mosaicGame.board.getPosition()
            .map(action => new Piece(action, this.mosaicGame.board.getItem(action)));
        this.placeableList = this.mosaicGame.board.legalPieces().getPosition();
        this.pointText.setText(`${this.mosaicGame.point.f}:${this.mosaicGame.point.s}`)
    }

    public destroyAll() {
        this.stoneList.forEach(s => { s.destroy() });
        this.holeList.forEach(h => { h.destroy() });
        this.stoneList.splice(0);
        this.holeList.splice(0);
    }
}