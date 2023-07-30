import { Scene } from 'excalibur';
// import Account from './account';
import Game from '../../Game';
import Banner from '../../actors/banner';
import { BannerData, BannerInfo } from '../../hooks/WorldContext';
import { CharacterInfo } from '../../hooks/UserContext';
import MaterialSlotActor from './materialSlotActor';
import MainActor from './mainActor';
import AvailableMaterialActor from './availableMaterialActor';
import MaterialSlotBorder from './materialSlotBorder';

export default class CharacterUpgradeScene extends Scene {
  mainActor?: MainActor;
  materialSlotActor?: MaterialSlotActor;
  availableMaterialActors: AvailableMaterialActor[];
  private allCharacters: CharacterInfo[];

  constructor() {
    super();
    this.availableMaterialActors = [];
    this.allCharacters = [];
  }

  onInitialize(game: Game): void {
    this.add(new MaterialSlotBorder());
  }

  setAllCharacters(characters: CharacterInfo[]) {
    this.allCharacters = characters;
    if (this.mainActor &&
      !characters.find(c =>
        c.address.equals(this.mainActor!.characterInfo.address))) {
      this.remove(this.mainActor);
      this.mainActor = undefined;
    }
    if (this.materialSlotActor &&
      !characters.find(c =>
        c.address.equals(this.materialSlotActor!.characterInfo.address))) {
      this.remove(this.materialSlotActor);
      this.materialSlotActor = undefined;
    }
    for (const a of this.availableMaterialActors) {
      this.remove(a);
    }
    this.availableMaterialActors = [];
    this.allCharacters
      .filter(v => !this.mainActor
        || !v.address.equals(this.mainActor.characterInfo.address) &&
        (!this.materialSlotActor
          || !v.address.equals(this.materialSlotActor.characterInfo.address)))
      .forEach((c, i) => {
        const actor = new AvailableMaterialActor(c, i);
        this.availableMaterialActors.push(actor);
        this.add(actor);
      })
  }

  setCharacter(characterInfo: CharacterInfo) {
    if (this.mainActor) {
      this.remove(this.mainActor);
    }
    this.mainActor = new MainActor(characterInfo);
    this.add(this.mainActor);
    for (const a of this.availableMaterialActors) {
      this.remove(a);
    }
    this.availableMaterialActors = [];
    this.allCharacters
      .filter(v => !v.address.equals(characterInfo.address) &&
        (!this.materialSlotActor
          || !v.address.equals(this.materialSlotActor.characterInfo.address)))
      .forEach((c, i) => {
        const actor = new AvailableMaterialActor(c, i);
        this.availableMaterialActors.push(actor);
        this.add(actor);
      })
  }

  setMaterial(characterInfo: CharacterInfo) {
    if (this.materialSlotActor) {
      this.remove(this.materialSlotActor);
    }
    this.materialSlotActor = new MaterialSlotActor(characterInfo);
    this.add(this.materialSlotActor);
    for (const a of this.availableMaterialActors) {
      this.remove(a);
    }
    this.availableMaterialActors = [];
    this.allCharacters
      .filter(v =>
        (!this.mainActor ||
          !v.address.equals(this.mainActor?.characterInfo.address)
        ) &&
        (!this.materialSlotActor
          || !v.address.equals(this.materialSlotActor.characterInfo.address)))
      .forEach((c, i) => {
        const actor = new AvailableMaterialActor(c, i);
        this.availableMaterialActors.push(actor);
        this.add(actor);
      })
  }

  resetMaterial() {
    if (this.materialSlotActor) {
      this.remove(this.materialSlotActor);
      this.materialSlotActor = undefined;

      for (const a of this.availableMaterialActors) {
        this.remove(a);
      }
      this.availableMaterialActors = [];
      this.allCharacters
        .filter(v =>
          !this.mainActor ||
          !v.address.equals(this.mainActor?.characterInfo.address)
        )
        .forEach((c, i) => {
          const actor = new AvailableMaterialActor(c, i);
          this.availableMaterialActors.push(actor);
          this.add(actor);
        })
    }
  }
}
