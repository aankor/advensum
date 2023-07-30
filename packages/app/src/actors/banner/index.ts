import { Actor, ImageSource, vec } from 'excalibur';
import { BannerData } from '../../hooks/WorldContext';

export default class Banner extends Actor {
  constructor(public bannerData: BannerData, public index: number) {
    super({
      pos: vec(1024, 180 + index * 256),
      width: 512,
      height: 256,
      anchor: vec(1.0, 0),
    });
  }

  onInitialize() {
    const image = new ImageSource(this.bannerData.image);
    image.load().then(() => {
      this.graphics.add(image.toSprite());
      this.on('pointerup', () => {
        alert('yo');
      });
    });
  }
}
