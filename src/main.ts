import Phaser from "phaser";
import { MosaicScene } from "./scenes/MosaicScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  physics: {
    default: 'matter',
    matter: {
      enableSleeping: true
    }
  },
  scene: [MosaicScene,],
};
new Phaser.Game(config);