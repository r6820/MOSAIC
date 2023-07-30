import { useEffect } from 'react'
import './App.css'
import { mosaicGame, createPhaser } from './phaser/main'
import { ButtonContainer } from './components/ui'
import { ext } from './common';
import { inputSwal, selectSwal } from './common';
import 'animate.css'
import './css/swal.css'

function saveData() {
  mosaicGame.scene.setInteractive(false);
  inputSwal('Save', (text) => {
    const filename = `${text || '_temp'}.${ext}`
    localStorage.setItem(filename, mosaicGame.exportData());
  }, () => { mosaicGame.scene.setInteractive(true); });
}

function loadData() {
  mosaicGame.scene.setInteractive(false);
  const nameArray = Object.keys(localStorage).filter(v => /^.*\.mof$/.test(v)).map(v => v.replace(/^(.*)\.mof$/, '$1'));
  if (nameArray.length == 0) { return }
  const keyNames: Record<string, string> = nameArray.reduce((obj, val, i) => ({ ...obj, [i]: val }), {});
  selectSwal('Load', keyNames, (index) => {
    const m = localStorage.getItem(`${keyNames[index] || '_temp'}.${ext}`);
    // console.log(index, m);
    if (m != null) {
      mosaicGame.importData(m);
    } else {
      throw new Error('error')
    }
  }, () => { mosaicGame.scene.allRerender(); });
}

function removeData() {
  mosaicGame.scene.setInteractive(false);
  const nameArray = Object.keys(localStorage).filter(v => /^.*\.mof$/.test(v)).map(v => v.replace(/^(.*)\.mof$/, '$1'));
  if (nameArray.length == 0) { return }
  const keyNames: Record<string, string> = nameArray.reduce((obj, val, i) => ({ ...obj, [i]: val }), {});
  selectSwal('Remove', keyNames, (index) => {
    localStorage.removeItem(`${keyNames[index]}.${ext}`);
  }, () => { mosaicGame.scene.setInteractive(true); });
}

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
        { id: 'saveData', label: 'save', onClick: saveData },
        { id: 'loadData', label: 'load', onClick: loadData },
        { id: 'removeData', label: 'remove', onClick: removeData }
      ]} />
    </>
  )
}

export default App
