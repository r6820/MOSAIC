import { useEffect } from 'react'
import './App.css'
import { mosaicGame, create } from './phaser/main'
import { PrevNext } from './components/ui'

function App() {
  useEffect(create, [])

  return (
    <>
      <div id="phaser-container"></div>
      <PrevNext onclickPrev={() => {mosaicGame.prev()}} onclickNext={() => {mosaicGame.next()}} />
    </>
  )
}

export default App
