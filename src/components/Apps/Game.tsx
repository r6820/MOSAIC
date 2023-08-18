import { useEffect } from 'react'
import { createPhaser, MosaicGame, saveData, loadData, removeData, defaultSize } from '@/phaser'
import { ButtonContainer } from '@/components'

import '@/css/App.css'
import '@/css/swal.css'
import 'animate.css'
import { useLocation } from 'react-router-dom'


export const Game = () => {
  let mosaicGame: MosaicGame;
  const { state } = useLocation();
  useEffect(()=>{
    mosaicGame = new MosaicGame(state.size || defaultSize, state.isAI || [false, false]);
    return createPhaser(mosaicGame);
  }, []);

  return (
    <>
      <div id="phaser-container"></div>
      <ButtonContainer buttons={[
        { id: 'prev-button', label: '<prev', onClick: () => mosaicGame.prev() },
        { id: 'next-button', label: 'next>', onClick: () => mosaicGame.next() }
      ]} />
      <ButtonContainer buttons={[
        { id: 'saveData', label: 'save', onClick: () => { saveData(mosaicGame) } },
        { id: 'loadData', label: 'load', onClick: () => { loadData(mosaicGame) } },
        { id: 'removeData', label: 'remove', onClick: () => { removeData(mosaicGame) } }
      ]} />
    </>
  )
}
