import Phaser from "phaser";
import { MosaicScene } from "./scenes/MosaicScene";
import { Constant } from "./scenes/Constant";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Constant.width,
  height: Constant.height,
  scene: [MosaicScene,],
};
new Phaser.Game(config);