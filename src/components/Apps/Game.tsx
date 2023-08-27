import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaFastBackward, FaFastForward, FaStepBackward, FaStepForward } from 'react-icons/fa';
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from '@/config/default';
import { createPhaser, MosaicGame, saveData, loadData, removeData, defaultSize, player } from '@/phaser';
import { Button } from '@/components';

import '@/css/App.css';
import '@/css/swal.css';
import 'animate.css';


type location = {
  state: {
    id?: number,
    size: number,
    players?: [player, player]
  }
}

let socket: Socket;
let mosaicGame: MosaicGame;

export const Game = () => {
  const [movesNum, setMovesNum] = useState(0);
  const { state } = useLocation() as location;
  useEffect(() => {
    if (state.id != null) { socket = io(SOCKET_URL); }
    mosaicGame = new MosaicGame(state.size || defaultSize, state.players || ['Online', 'Online']);
    mosaicGame.onChangeMovesNum((n) => { setMovesNum(n) });
    const destroy = createPhaser(mosaicGame);
    return state.id == null
      ? destroy
      : () => {
        socket.disconnect();
        destroy();
      }
  }, []);

  return (
    <div>
      <div id="phaser-container"></div>
      {state.id != null
        ? <div className='online-container'>
          <Button id='join-as-player1' label='player1' onClick={() => { }} />
          <label className='m-2'>{movesNum}</label>
          <Button id='join-as-player1' label='player1' onClick={() => { }} />
        </div>
        : <div className='offline-container'>
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
        </div>}
    </div>
  )
}
