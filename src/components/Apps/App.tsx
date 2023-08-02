import { useEffect } from 'react'
import { createPhaser, MosaicGame, saveData, loadData, removeData } from '@/phaser'
import { ButtonContainer } from '@/components'

import '@/css/App.css'
import '@/css/swal.css'
import 'animate.css'


let mosaicGame: MosaicGame;

export function App() {
  useEffect(()=>{
    mosaicGame = new MosaicGame([false, false], 5);
    createPhaser(mosaicGame);
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
