import { Actor, Color, ImageSource, Label, vec } from 'excalibur';
import { CharacterInfo } from '../../hooks/UserContext';
import Game from '../../Game';

export default class MainActor extends Actor {
  constructor(public characterInfo: CharacterInfo) {
    super({
      pos: vec(20, 80),
      width: 256,
      height: 256,
      anchor: vec(0, 0),
    });
  }

  onInitialize() {
    Game.raw.loadImage(this.characterInfo.image).then((image) => {
      const sprite = image.toSprite();
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
    });
  }
}
