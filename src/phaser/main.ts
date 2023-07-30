import Phaser from "phaser";
import {MosaicGame, colors, height, width } from "./";

export const mosaicGame = new MosaicGame([false, true]);

const mosaicScene = mosaicGame.scene;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: colors.bg,
  width: width,
  height: height,
  scene: [mosaicScene,],
};

export function createPhaser(): () => void {
  const g = new Phaser.Game(config);
  g.scene
  return () => {
    g?.destroy(true);
  }
}

