import { Scene} from 'excalibur';
// import Account from './account';
import Game from '../../Game';
import Banner from '../../actors/banner';
import { BannerData } from '../../hooks/WorldContext';
import { CharacterInfo } from '../../hooks/UserContext';
import Character from '../../actors/character';

export default class CharactersScene extends Scene {
  characters: Character[];

  constructor() {
    super();
    this.characters = [];
  }

  onInitialize(game: Game): void {
    // this.add(new Account());
  }

  syncCharacters(characters: CharacterInfo[]) {
    if (characters.length !== this.characters.length) {
      for (let i = 0; i < characters.length; i++) {
        const actor = new Character(characters[i], i);
        this.characters.push(actor);
        this.add(actor);
      }
    }
  }
}
