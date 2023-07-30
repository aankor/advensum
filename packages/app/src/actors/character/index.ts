import { Actor, ImageSource, vec } from 'excalibur';
import { CharacterInfo } from '../../hooks/UserContext';

export default class Character extends Actor {
  constructor(public characterInfo: CharacterInfo, public index: number) {
    super({
      pos: vec(20 + (index % 6) * 132, 80 + Math.floor(index / 6) * 150),
      width: 128,
      height: 128,
      anchor: vec(0, 0),
    });
  }

  onInitialize() {
    const image = new ImageSource(this.characterInfo.image);
    image.load().then(() => {
      const sprite = image.toSprite();
      sprite.width = 128;
      sprite.height = 128;
      this.graphics.add(sprite);
      this.on('pointerup', () => {
        alert('yo');
      });
    });
  }
}
