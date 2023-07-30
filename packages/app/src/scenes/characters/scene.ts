import { Scene } from 'excalibur';
// import Account from './account';
import Game from '../../Game';
import Banner from '../../actors/banner';
import { BannerData } from '../../hooks/WorldContext';
import { CharacterInfo } from '../../hooks/UserContext';
import Character from '../../actors/character';

export default class CharactersScene extends Scene {
  characterActors: Character[];

  constructor() {
    super();
    this.characterActors = [];
  }

  onInitialize(game: Game): void {
    // this.add(new Account());
  }

  syncCharacters(characters: CharacterInfo[]) {
    for (const c of this.characterActors) {
      this.remove(c);
    }
    this.characterActors = [];
    for (let i = 0; i < characters.length; i++) {
      const actor = new Character(characters[i], i);
      this.characterActors.push(actor);
      this.add(actor);
    }
  }
}
