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
    players?: [player, player],
    player1?: string,
    player2?: string,
    status?: number
  }
}

let socket: Socket;
let mosaicGame: MosaicGame;

export const Game = () => {
  const [movesNum, setMovesNum] = useState(0);
  const [userState, setUserState] = useState(0); // 0: offline or spectator, 1: player1, 2: player2
  const [userName, setUserName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const { state } = useLocation() as location;
  useEffect(() => {
    setPlayer1Name(state.player1||'');
    setPlayer2Name(state.player2||'');
    if (state.id != null) {
      socket = io(SOCKET_URL);
      socket.on('joined game', (res: { id: number, player1?: string, player2?: string, size: number, status: number, game_record: string }) => {
        console.log('joined the game');
        
        setPlayer1Name(res.player1||'');
        setPlayer2Name(res.player2||'');
        
        if (res.status==0 && userState==1) {
          socket.emit('start', {room_id: state.id, game_record: mosaicGame.exportData()});
        }
      });
      const _userName = localStorage.getItem('username') || '';
      setUserName(_userName.replace(/\s+/g, '') == '' ? 'null' : _userName);
      socket.emit('join', { room_id: state.id, user_name: _userName });
    }
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
          <div className='player-name flex flex-row'>
            <div className='text-left flex-1'>{player1Name}</div>
            <div className='text-right flex-1'>{player2Name}</div>
          </div>
          <div className='join-game'>
            <Button id='join-as-player1' label='player1' onClick={() => {
              if (userState==1) {return}
              socket.emit('join game', { room_id: state.id, player_num: 1, user_name: userName });
              socket.off('check player2');
              socket.on('check player1', ()=>{
                socket.emit('rejoin game', { room_id: state.id, player_num: 1, user_name: userName });
              });
              setUserState(1);
            }} />
            <label className='m-2'>{movesNum}</label>
            <Button id='join-as-player2' label='player2' onClick={() => {
              if (userState==2) {return}
              socket.emit('join game', { room_id: state.id, player_num: 2, user_name: userName });
              socket.off('check player1');
              socket.on('check player2',()=>{
                socket.emit('rejoin game', { room_id: state.id, player_num: 2, user_name: userName });
              });
              setUserState(2);
            }} />
          </div>
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
