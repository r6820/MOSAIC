import Phaser from "phaser";
import { MosaicGame, colors, height, width } from "@/phaser";

export function createPhaser(mosaicGame: MosaicGame): () => void {
  const mosaicScene = mosaicGame.scene;
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: colors.bg,
    scale: {
      mode: Phaser.Scale.ENVELOP,
      parent: 'phaser-container',
      width: width,
      height: height,
    },
    scene: [mosaicScene,],
  };
  const g = new Phaser.Game(config);
  window.onload = () => { resize(); };
  window.addEventListener('resize', () => {
    resize();
    g?.scale.refresh();
  });
  return () => {
    g?.destroy(true);
  }
}

const resize = () => {
  let canvas = document.querySelector('canvas');
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;
  if (canvas) {
    if (windowWidth < 800 || windowHeight < 800) {
      if (windowWidth < windowHeight) {
        canvas.style.width = `${windowWidth}px`;
        canvas.style.height = `${windowWidth}px`;
      }
      else {
        canvas.style.width = `${windowHeight}px`;
        canvas.style.height = `${windowHeight}px`;
      }
    }
  }
}
