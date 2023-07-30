import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUserContext } from '../../hooks/UserContext';
import CharactersScene from './scene';
import CharacterUpgradeScene from './scene';
import { useWorldContext } from '../../hooks/WorldContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

const CharacterUpgradeUi: FC = () => {
  const { program, worldPk } = useWorldContext();
  const { characters } = useUserContext();
  const { publicKey } = useWallet();

  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['characterUpgrade'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['characterUpgrade'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['characterUpgrade'].off('activate', activateHandler);
        Game.raw.scenes['characterUpgrade'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  const goBack = useCallback(() => {
    Game.raw.goToScene('characters');
  }, []);

  const handleUpgrade = useCallback(() => {
    if (!program || !publicKey) {
      return;
    }
    (async () => {
      const scene = Game.raw.scenes['characterUpgrade'] as CharacterUpgradeScene;
      const material = scene.materialSlotActor?.characterInfo;
      if (!material) {
        return
      }
      const txSig = await program.methods.upgadeCharacter()
        .accountsStrict({
          world: worldPk,
          character: scene.mainActor!.characterInfo.address,
          owner: publicKey,
          characterMint: scene.mainActor!.characterInfo.data.mint,
          characterToken: scene.mainActor!.characterInfo.token,
          material: material.address,
          materialMint: material.data.mint,
          materialToken: material.token,
          rentCollector: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc()
        console.log(txSig)
    })();
  }, [program, publicKey, worldPk]);

  useEffect(() => {
    if (characters) {
      const scene = Game.raw.scenes['characterUpgrade'] as CharacterUpgradeScene;
      scene.setAllCharacters(characters);
    }
  }, [characters]);

  return (
    <>{active ? <div id="root-ui" className='container'>
      <Button variant="contained" onClick={goBack}><ArrowBackIcon /></Button>
      <Button variant="contained" onClick={handleUpgrade} id='upgrade-button'>Upgrade</Button>
    </div > : ''}</>
  );
};

export default CharacterUpgradeUi;