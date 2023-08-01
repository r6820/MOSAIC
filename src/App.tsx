import { useEffect } from 'react'
import './App.css'
import { mosaicGame, createPhaser } from './phaser/main'
import { saveData, loadData, removeData } from './phaser'
import { ButtonContainer } from './components/ui'

import 'animate.css'
import './css/swal.css'



function App() {
  useEffect(createPhaser, []);

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

export default App
