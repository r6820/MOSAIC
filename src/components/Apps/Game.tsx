import { useEffect, useState } from 'react';
import { FaFastBackward, FaFastForward, FaStepBackward, FaStepForward } from 'react-icons/fa';
import { createPhaser, MosaicGame, saveData, loadData, removeData, defaultSize, player } from '@/phaser';
import { Button } from '@/components';

import '@/css/App.css';
import '@/css/swal.css';
import 'animate.css';
import { useLocation } from 'react-router-dom';

type location = {
  state: {
    size: number,
    players: [player, player]
  }
}

let mosaicGame: MosaicGame;

export const Game = () => {
  const [movesNum, setMovesNum] = useState(0);
  const { state } = useLocation() as location;
  useEffect(() => {
    mosaicGame = new MosaicGame(state.size || defaultSize, state.players || ['human', 'human']);
    mosaicGame.onChangeMovesNum((n) => { setMovesNum(n) });
    const destroy = createPhaser(mosaicGame);
    return destroy
  }, []);

  return (
    <div>
      <div id="phaser-container"></div>
      <div className='turn-operation'>
        <Button id='fast-backward-button' label={<FaFastBackward />} onClick={() => mosaicGame.fastBackward()} />
        <Button id='prev-button' label={<FaStepBackward />} onClick={() => mosaicGame.prev()} />
        <label className='m-2'>{movesNum}</label>
        <Button id='next-button' label={<FaStepForward />} onClick={() => mosaicGame.next()} />
        <Button id='fast-forward-button' label={<FaFastForward />} onClick={() => mosaicGame.fastForward()} />
      </div>
      <div className='game-record-operation'>
        <Button id='save-button' label='save' onClick={() => { saveData(mosaicGame) }} />
        <Button id='load-button' label='load' onClick={() => { loadData(mosaicGame) }} />
        <Button id='remove-button' label='remove' onClick={() => { removeData(mosaicGame) }} />
      </div>
    </div>
  )
}
