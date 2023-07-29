import { Board } from '../..';
import * as tf from '@tensorflow/tfjs';
import { pvMCTSAction } from './mcts';

export class tfjsModel {
    private size: number;
    constructor(size: number) {
        this.size = size;
    }

    public async test(input: Board<number>) {
        const model = await tf.loadGraphModel(`/tfjs_models/size_${this.size}/model.json`);
        const action = pvMCTSAction(model as tf.GraphModel);
        return action(input)
    }
}
