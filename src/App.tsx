import { useEffect } from 'react'
import './App.css'
import { create } from './phaser/main'

function App() {
  useEffect(create, [])

  return (
    <>
      <div id="phaser-container"></div>
      <div id='prev-next'></div>
    </>
  )
}

export default App
