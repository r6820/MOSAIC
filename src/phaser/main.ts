import Phaser from "phaser";
import { MosaicGame, colors, height, width } from "@/phaser";

export function createPhaser(mosaicGame: MosaicGame): () => void {
  const mosaicScene = mosaicGame.scene;
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    backgroundColor: colors.bg,
    width: width,
    height: height,
    scene: [mosaicScene,],
  };
  const g = new Phaser.Game(config);
  return () => {
    g?.destroy(true);
  }
}

