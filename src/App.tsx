import { useEffect } from 'react'
import './App.css'
import { mosaicGame, createPhaser } from './phaser/main'
import { PrevNext } from './components/ui'

function App() {
  useEffect(createPhaser, [])

  return (
    <>
      <div id="phaser-container"></div>
      <PrevNext onclickPrev={() => {mosaicGame.prev()}} onclickNext={() => {mosaicGame.next()}} />
    </>
  )
}

export default App
