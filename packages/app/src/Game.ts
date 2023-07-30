import { Color, Engine, ImageSource, Loader, Scene } from "excalibur";
import RootScene from "./scenes/root/scene";
import logo from "./logo";
import { PublicKey } from "@solana/web3.js";
import Lobby from "./scenes/lobby/scene";
import CharactersScene from "./scenes/characters/scene";
import CharacterUpgradeScene from "./scenes/characterUpgrade/scene";

// export type WorldData = IdlAccounts<Advensum>['world'];
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class Game extends Engine {
  world: PublicKey;
  // rpcEndpoint?: string;
  // worldData?: WorldData;
  images: Map<string, ImageSource | null>;

  constructor() {
    super({
      width: 1024, 
      height: 768, 
      backgroundColor: Color.fromHex('#ccffff')
    });
    this.add('root', new RootScene());
    this.add('lobby', new Lobby());
    this.add('characters', new CharactersScene());
    this.add('items', new Scene());
    this.add('battles', new Scene());
    this.add('summon', new Scene());
    this.add('addEnergy', new Scene());
    this.add('removeEnergy', new Scene());
    this.add('addSummonite', new Scene());
    this.add('removeSummonite', new Scene());
    this.add('characterUpgrade', new CharacterUpgradeScene());
    this.images = new Map();

    this.world = new PublicKey('3TVtzmya5YMsEu4JRP5njkpmDrWst5ad4XXhwfdWU69m');
  }

  async loadImage(path: string): Promise<ImageSource> {
    let image = this.images.get(path);
    if (image === null) {
      while (image === null) {
        await sleep(100);
        image = this.images.get(path);
      }
    }
    if (image) {
      return image;
    }
    this.images.set(path, null);
    image = new ImageSource(path);
    await image.load();
    this.images.set(path, image);
    return image;
  }

  async initialize() {
    const loader = new Loader([
    ]);
    loader.suppressPlayButton = true;
    loader.backgroundColor = '#ccffff';
    loader.logoHeight = 150;
    loader.logo = logo;
    await this.start(loader);
  }

  /*
  async loadWorld(program: Program<Advensum>) {
    if (program.provider.connection.rpcEndpoint === this.rpcEndpoint) {
      return;
    }
    this.rpcEndpoint = program.provider.connection.rpcEndpoint;
    this.worldData = await program.account.world.fetch(this.world);
    console.log(`Energy ${this.worldData.energyMint.toBase58()}`);
  }*/

  private static _instance?: Game;

  static async instance(): Promise<Game> {
    if (!this._instance) {
      this._instance = new Game();
      await this._instance.initialize();
    }
    return this._instance;
  }

  static get raw(): Game {
    if (!this._instance) {
      this._instance = new Game();
      this._instance.initialize();
    }
    return this._instance;
  }
}
