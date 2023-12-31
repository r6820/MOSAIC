import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFastBackward, FaFastForward, FaStepBackward, FaStepForward } from 'react-icons/fa';
import io, { Socket } from "socket.io-client";
import axios from 'axios';

import { API_URL, SOCKET_URL } from '@/config/default';
import { createPhaser, MosaicGame, saveData, loadData, removeData, defaultSize, player, Position } from '@/phaser';
import { Button } from '@/components';

import '@/css/App.css';
import '@/css/swal.css';
import 'animate.css';

type GameData = {
  id: number,
  player1?: string,
  player2?: string,
  size: number,
  status: number,
  game_record: string
}

type Location = {
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
  const [userName, setUserName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [userState, setUserState] = useState<0 | 1 | 2>(0); // 0: offline or spectator, 1: player1, 2: player2
  const { state } = useLocation() as Location;
  const navigate = useNavigate();
  useEffect(() => {
    setUserState(0);
    setPlayer1Name(state.player1 || '');
    setPlayer2Name(state.player2 || '');
    mosaicGame = new MosaicGame(state.size || defaultSize, state.players || ['Online', 'Online']);
    mosaicGame.onChangeMovesNum((n) => { setMovesNum(n) });
    if (state.id != null) {
      socket = io(SOCKET_URL);

      const disconnected = (res: GameData) => {
        console.log('disconnected');

        setPlayer1Name(res.player1 || '');
        setPlayer2Name(res.player2 || '');
      };
      const joinedRoom = (res: GameData) => {
        console.log('joined the room');

        setPlayer1Name(res.player1 || '');
        setPlayer2Name(res.player2 || '');
        mosaicGame.scene.addTask(() => {
          mosaicGame.importData(res.game_record, -1);
          mosaicGame.scene.allRerender();
        }, 1)
      };
      const joinedGame = (res: GameData) => {
        console.log('joined the game');

        setPlayer1Name(res.player1 || '');
        setPlayer2Name(res.player2 || '');

        if (userState != 0 && mosaicGame.userState == 0 && res.player1 && res.player2) {
          if (userState == 1){
            socket.emit('start', { game_id: state.id, game_record: mosaicGame.exportData() });
          }
          mosaicGame.userState = userState;
          mosaicGame.scene.move = ({ i, j, k }: Position) => {
            mosaicGame.scene.addTask(() => {
              socket.emit('move', { game_id: state.id, turn: mosaicGame.current_turn(), position: [i, j, k] })
            });
          }
          mosaicGame.turn();
        }
      };
      const move = ([i, j, k]: [number, number, number]) => {
        mosaicGame.move({ i, j, k });
      };
      const disconnect = () => { navigate('/online') };

      socket.on('player disconnected', disconnected);
      socket.on('joined', joinedRoom);
      socket.on('joined game', joinedGame);
      socket.on('move', move);
      socket.on('disconnect', disconnect);
      
      mosaicGame.setFinish(() => { socket.emit('finish', { game_id: state.id }) });

      const _userName = localStorage.getItem('username') || '';
      setUserName(_userName.replace(/\s+/g, '') == '' ? 'null' : _userName);
      socket.emit('join', { game_id: state.id });
      axios.get(
        `${API_URL}/game`, {
        params: {
          game_id: state.id
        }
      }
      ).then((res) => {
        console.log(res.data);
        const gameRecord = res.data.game.game_record;
        if (gameRecord) {
          mosaicGame.importData(gameRecord);
        }
      }).catch((reason) => {
        console.log(reason);
        navigate('/online');
      });
    }
    const destroy = createPhaser(mosaicGame);
    return state.id == null
      ? destroy
      : () => {
        socket.disconnect();
        destroy();
      }
  }, []);

  const JoinButton = (props: { num: 1 | 2, eNum: 1 | 2 }) => {
    return (
      <Button id={`join-as-player${props.num}`} label={`player${props.num}`} onClick={() => {
        if (userState != 0) { return }
        socket.emit('join game', { game_id: state.id, player_num: props.num, user_name: userName });
        setUserState(props.num);
      }} />
    )
  }

  const OnlineContainer = () => {
    return (
      <div className='online-container'>
        <div className='player-name flex flex-row'>
          <div className='text-left flex-1'>{player1Name}</div>
          <div className='text-right flex-1'>{player2Name}</div>
        </div>
        <div className='join-game'>
          <JoinButton num={1} eNum={2} />
          <label className='m-2'>{movesNum}</label>
          <JoinButton num={2} eNum={1} />
        </div>
      </div>
    )
  }

  const OfflineContainer = () => {
    return (
      <div className='offline-container'>
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

  return (
    <div>
      <div id="phaser-container"></div>
      {state.id != null
        ? <OnlineContainer />
        : <OfflineContainer />}
    </div>
  )
}
