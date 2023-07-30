import { Scene} from 'excalibur';
// import Account from './account';
import Game from '../../Game';
import Banner from '../../actors/banner';
import { BannerData, BannerInfo } from '../../hooks/WorldContext';

export default class Lobby extends Scene {
  banners: Banner[];

  constructor() {
    super();
    this.banners = [];
  }

  onInitialize(game: Game): void {
    // this.add(new Account());
  }

  syncBanners(banners: BannerInfo[]) {
    if (banners.length !== this.banners.length) {
      for (let i = 0; i < banners.length; i++) {
        const actor = new Banner(banners[i], i);
        this.banners.push(actor);
        this.add(actor);
      }
    }
  }
}
