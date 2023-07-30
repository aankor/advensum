import { Actor, ImageSource, vec } from 'excalibur';
import { CharacterInfo } from '../../hooks/UserContext';

export default class Character extends Actor {
  constructor(public characterInfo: CharacterInfo, public index: number) {
    super({
      pos: vec(20 + index * 260, 100),
      width: 256,
      height: 512,
      anchor: vec(0, 0),
    });
  }

  onInitialize() {
    const image = new ImageSource(this.characterInfo.image);
    image.load().then(() => {
      this.graphics.add(image.toSprite());
      this.on('pointerup', () => {
        alert('yo');
      });
    });
  }
}
