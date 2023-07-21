import { useEffect } from 'react'
import './App.css'
import { PrevNext } from './components/ui'
import { create } from './phaser/main'

function App() {
  useEffect(create, [])

  return (
    <>
      <div id="phaser-container"></div>
      <PrevNext onclickPrev={()=>{}} onclickNext={()=>{}}/>
    </>
  )
}

export default App
