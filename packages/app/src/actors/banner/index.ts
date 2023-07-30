import { Actor, ImageSource, vec } from 'excalibur';
import { BannerInfo } from '../../hooks/WorldContext';
import Game from '../../Game';

export default class Banner extends Actor {
  public clickCallback: (info: BannerInfo) => Promise<void>
  constructor(public info: BannerInfo, public index: number) {
    super({
      pos: vec(1024, 180 + index * 256),
      width: 512,
      height: 256,
      anchor: vec(1.0, 0),
    });
    this.clickCallback = () => {
      return Promise.resolve()
    }
  }

  onInitialize() {
    Game.raw.loadImage(this.info.data.image).then((image) => {
      this.graphics.add(image.toSprite());
      this.on('pointerup', () => {
        this.clickCallback(this.info);
      });
    });
  }
}
