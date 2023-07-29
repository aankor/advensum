import { Scene } from 'excalibur';
// import Account from './account';
import Game from '../../Game';
import { Keypair } from '@solana/web3.js';
import { Battle as BattleBox } from '../../actors/Battle';

export default class Battles extends Scene {
    onInitialize(game: Game): void {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 10; col++) {
                let key = Keypair.generate();
                this.add(new BattleBox(50 + col * 80, 100 + row * 50, key.publicKey.toBase58()))
            }
        }
        // this.add(new Account());
    }
}
