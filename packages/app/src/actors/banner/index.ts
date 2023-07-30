import { Actor, ImageSource, vec } from 'excalibur';
import { BannerInfo } from '../../hooks/WorldContext';

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
    const image = new ImageSource(this.info.data.image);
    image.load().then(() => {
      this.graphics.add(image.toSprite());
      this.on('pointerup', () => {
        this.clickCallback(this.info);
      });
    });
  }
}
