import Phaser from "phaser";
import { MosaicScene } from "../scenes/MosaicScene";
import { Constants } from "../utils/Constants";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: Constants.colors.bg,
  width: Constants.width,
  height: Constants.height,
  scene: [MosaicScene,],
};
new Phaser.Game(config);