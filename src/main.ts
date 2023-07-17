import Phaser from "phaser";
import { MosaicScene } from "./scenes/MosaicScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: [MosaicScene,],
};
new Phaser.Game(config);