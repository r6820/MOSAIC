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
  return () => {
    g?.destroy(true);
  }
}

