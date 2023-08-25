import { useEffect } from 'react'
import { createPhaser, MosaicGame, saveData, loadData, removeData, defaultSize, player } from '@/phaser'
import { ButtonContainer } from '@/components'

import '@/css/App.css'
import '@/css/swal.css'
import 'animate.css'
import { useLocation } from 'react-router-dom'

type location = {
  state: {
    size: number,
    players: [player, player]
  }
}

export const Game = () => {
  let mosaicGame: MosaicGame;
  const { state } = useLocation() as location;
  useEffect(() => {
    mosaicGame = new MosaicGame(state.size || defaultSize, state.players || ['human', 'human']);
    const destroy = createPhaser(mosaicGame);
    return destroy
  }, []);

  return (
    <div>
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
    </div>
  )
}
