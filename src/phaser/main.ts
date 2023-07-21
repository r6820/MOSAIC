import Phaser from "phaser";
import { MosaicScene, Constants } from "./";

const mosaicScene = new MosaicScene()

export const mosaicGame = mosaicScene.mosaicGame

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: Constants.colors.bg,
  width: Constants.width,
  height: Constants.height,
  scene: [mosaicScene,],
};

export function create(): () => void {
  const g = new Phaser.Game(config);
  g.scene
  return () => {
    g?.destroy(true);
  }
}

