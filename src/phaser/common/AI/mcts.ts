import { Action, Board, Position, playerId } from '@/phaser';
import { tensor, Tensor, GraphModel } from '@tensorflow/tfjs';
import { argmax, sum } from '@/common';
import * as tf from '@tensorflow/tfjs';

export const PV_EVAL_BASIS = 50;
export const PV_MAX_LEVEL = 20

const predictMemo: { [size: number]: { [key: string]: [number, number[]] } } = {};

class MCTSNode {
    private board: Board<number>;
    private p: number;
    private w: number;
    public n: number;
    public childNodes: MCTSNode[] = [];
    constructor(board: Board<number>, p: number) {
        this.board = board;
        this.p = p;
        this.w = 0;
        this.n = 0;
    }

    public evaluate(model: GraphModel) {
        const isDone = this.board.isDone();
        let value = 0;
        let policies: number[] = [];
        if (isDone) {
            value = this.board.firstPlayerValue();
        } else if (this.childNodes.length == 0) {
            [value, policies] = MCTSNode.predict(model, this.board);
            this.childNodes = this.board.nextAll(playerId.first).map((v, i) => new MCTSNode(v.flip(), policies[i]));
        } else {
            value = -this.nextChildNode().evaluate(model);
        }

        this.w += value;
        this.n += 1;
        return value

    }

    private nextChildNode(): MCTSNode {
        const C_PUCT = 1;
        const t = sum(this.childNodes.map(node => node.n));
        const pucbValues = this.childNodes.map(node => (node.n == 0 ? 0 : -node.w / node.n) + C_PUCT * node.p * t ** 0.5 / (1 + node.n));
        return this.childNodes[argmax(pucbValues)]
    }

    private static convertToTensor(board: Board<number>): Tensor {
        const players = [playerId.first, playerId.second]
        return tensor([players.map(p => (board.mapPiece(({ value: v }) => Number(v == p)) as number[][][]).map(v1 =>
            [...v1, ...new Array<Array<number>>(board.length - v1.length).fill([0]).map(() => new Array<number>(v1.length).fill(0))].map(v2 =>
                [...v2, ...new Array<number>(board.length - v2.length).fill(0)]
            )
        ))]);
    }

    private static predict(model: GraphModel, board: Board<number>): [number, number[]] {
        const size = board.length;
        const key = JSON.stringify(board);
        let predictValue;
        if (!(size in predictMemo)){
            predictMemo[size] = {};
        }
        if (key in predictMemo[size]) {
            predictValue = predictMemo[size][key]
        } else {
            predictValue = tf.tidy(() => {
                const boardTensor = MCTSNode.convertToTensor(board);
                const [t1, t2] = model.predict(boardTensor) as [Tensor, Tensor];
                const value = (t1.arraySync() as number[][])[0][0];
                let policies = (t2.arraySync() as number[][])[0];
                policies = board.legalActionArray().map(({ i, j, k }) => policies[i * size ** 2 + j * size + k]);
                const policiesSum = sum(policies);
                policies = policies.map(v => v / policiesSum);
                const _predictValue: [number, number[]] = [value, policies]
                return _predictValue
            });
            predictMemo[size][key] = predictValue;
        }
        return predictValue
    }
}

export class MCTS {
    private size: number;
    private evalNum: number;
    public action?: Action;
    private memo: { [key: string]: Position } = {};
    constructor(size: number, evalNum: number) {
        this.size = size;
        this.evalNum = evalNum;
    }

    private pvMCTSScores(model: GraphModel, board: Board<number>): number[] {
        const rootNode = new MCTSNode(board, 0);
        for (let i = 0; i < this.evalNum; i++) {
            rootNode.evaluate(model);
        }
        return rootNode.childNodes.map(node => node.n)
    }

    private pvMCTSAction(model: GraphModel) {
        return async (board: Board<number>) => {
            const startTime = Date.now();
            const key = JSON.stringify(board);
            let pos: Position;
            if (key in this.memo) {
                pos = this.memo[key];
            } else {
                const scores = this.pvMCTSScores(model, board);
                pos = board.legalActionArray()[argmax(scores)];
                this.memo[key] = pos;
            }
            const endTime = Date.now();
            console.log('predict:', endTime - startTime, 'ms');
            console.log('position', pos);
            return pos
        }
    }

    public async loadModel(prepareBoard?: Board<number>) {
        console.log('loading...');
        const startTime = Date.now();
        const model = await tf.loadGraphModel(import.meta.env.BASE_URL + `/tfjs_models/size_${this.size}/model.json`);
        const action = this.pvMCTSAction(model);
        if (prepareBoard) { action(prepareBoard); }
        const endTime = Date.now();
        console.log('load model:', endTime - startTime, 'ms');
        this.action = action
    }
}
