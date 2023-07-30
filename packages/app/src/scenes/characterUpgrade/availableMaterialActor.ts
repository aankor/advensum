import { Actor, Color, ImageSource, vec, Label } from 'excalibur';
import { CharacterInfo } from '../../hooks/UserContext';
import Game from '../../Game';
import CharacterUpgradeScene from '../../scenes/characterUpgrade/scene';

export default class AvailableMaterialActor extends Actor {
  constructor(public characterInfo: CharacterInfo, public index: number) {
    super({
      pos: vec(296 + (index % 3) * 132, 80 + Math.floor(index / 3) * 150),
      width: 128,
      height: 128,
      anchor: vec(0, 0),
    });
  }

  onInitialize() {
    Game.raw.loadImage(this.characterInfo.image).then((image) => {
      const sprite = image.toSprite();
      sprite.width = 128;
      sprite.height = 128;
      this.graphics.add(sprite);
      this.addChild(new Label({
        text: 'Level: ' + this.characterInfo.data.level,
        color: Color.Yellow,
        x: 10,
        y: 20,
      }));
      this.addChild(new Label({
        text: 'Hp: ' + this.characterInfo.data.hp,
        color: Color.Yellow,
        x: 10,
        y: 40,
      }));
      this.addChild(new Label({
        text: 'Attack: ' + this.characterInfo.data.attack,
        color: Color.Yellow,
        x: 10,
        y: 60,
      }));
      this.on('pointerup', () => {
        const scene = Game.raw.scenes['characterUpgrade'] as CharacterUpgradeScene;
        scene.setMaterial(this.characterInfo);
      });
    });
  }
}
