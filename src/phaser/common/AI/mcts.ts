import { Board } from '../MosaicGame';
import { phaserConstants as Constants } from '../Constants';
import { tensor, Tensor, GraphModel } from '@tensorflow/tfjs';
import { Position } from '../types';
import { argmax, sum } from '../../../common';

const PV_EVAL_NUM = 10

function convertToTensor(board: Board<number>): Tensor {
    const players = [Constants.playerId.first, Constants.playerId.second]
    return tensor([players.map(p => (board.mapPiece(({ value: v }) => Number(v == p)) as number[][][]).map(v1 =>
        [...v1, ...new Array<Array<number>>(board.length - v1.length).fill([0]).map(() => new Array<number>(v1.length).fill(0))].map(v2 =>
            [...v2, ...new Array<number>(board.length - v2.length).fill(0)]
        )
    ))]);
}

function predict(model: GraphModel, board: Board<number>): [number, number[]] {
    const size = board.length
    const [t1, t2] = model.predict(convertToTensor(board)) as [Tensor, Tensor];
    const value = (t1.arraySync() as number[][])[0][0];
    let policies = (t2.arraySync() as number[][])[0];
    policies = board.legalActions().map(({ i, j, k }) => policies[i * size ** 2 + j * size + k]);
    const _sum = sum(policies);
    policies = policies.map(v => v / _sum);
    return [value, policies]
}

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
        const fp = this.board.isWin(Constants.playerId.first);
        const sp = this.board.isWin(Constants.playerId.second);
        let value = 0;
        let policies: number[] = [];
        if (fp || sp) {
            value = fp ? (sp ? 0 : 1) : -1;
        } else if (this.childNodes.length == 0) {
            [value, policies] = predict(model, this.board);
            this.childNodes = this.board.nextAll(Constants.playerId.first).map((v, i) => new MCTSNode(v.flip(), policies[i]));
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
}

function pvMCTSScores(model: GraphModel, board: Board<number>): number[] {
    const rootNode = new MCTSNode(board, 0);
    for (let i = 0; i < PV_EVAL_NUM; i++) {
        rootNode.evaluate(model);
    }
    return rootNode.childNodes.map(node => node.n)
}

export function pvMCTSAction(model: GraphModel): (board: Board<number>) => Position {
    return (board: Board<number>) => {
        const scores = pvMCTSScores(model, board);
        return board.legalActions()[argmax(scores)]
    }
}