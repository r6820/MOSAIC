import { MosaicGame, ext } from '@/phaser';
import { inputSwal, selectSwal } from '@/common';

export function saveData(mosaicGame: MosaicGame) {
    mosaicGame.scene.setInteractive(false);
    inputSwal('Save', (text) => {
        const filename = `${text || '_temp'}.${ext}`
        localStorage.setItem(filename, mosaicGame.exportData());
    }, () => { mosaicGame.scene.setInteractive(true); });
}

export function loadData(mosaicGame: MosaicGame) {
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
    }, () => {
        mosaicGame.scene.allRerender();
        mosaicGame.scene.setInteractive(true);
    });
}

export function removeData(mosaicGame: MosaicGame) {
    mosaicGame.scene.setInteractive(false);
    const nameArray = Object.keys(localStorage).filter(v => /^.*\.mof$/.test(v)).map(v => v.replace(/^(.*)\.mof$/, '$1'));
    if (nameArray.length == 0) { return }
    const keyNames: Record<string, string> = nameArray.reduce((obj, val, i) => ({ ...obj, [i]: val }), {});
    selectSwal('Remove', keyNames, (index) => {
        localStorage.removeItem(`${keyNames[index]}.${ext}`);
    }, () => { mosaicGame.scene.setInteractive(true); });
}