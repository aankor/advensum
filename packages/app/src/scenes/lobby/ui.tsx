import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@mui/material';
import Energy from '../../components/Energy';
import Summonite from '../../components/Summonite';
import { BannerInfo, useWorldContext } from '../../hooks/WorldContext';
import Lobby from './scene';
import { ComputeBudgetProgram, Keypair, PublicKey, SYSVAR_RECENT_BLOCKHASHES_PUBKEY, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';
import { characterAddress, minterAddress } from '../../pdas';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const LobbyUi: FC = () => {
  const { wallet, publicKey } = useWallet();
  const handleDisconnect = useCallback(() => {
    Game.raw.goToScene('root');
  }, []);

  useEffect(() => {
    wallet?.adapter.on('disconnect', handleDisconnect);

    return () => {
      wallet?.adapter.off('disconnect', handleDisconnect)
    }
  }, [wallet, handleDisconnect]);
  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['lobby'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['lobby'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['lobby'].off('activate', activateHandler);
        Game.raw.scenes['lobby'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  const gotoCharacters = useCallback(() => {
    Game.raw.goToScene('characters');
  }, []);

  const gotoItems = useCallback(() => {
    Game.raw.goToScene('items')
  }, []);

  const gotoBattles = useCallback(() => {
    Game.raw.goToScene('battles')
  }, []);

  const { banners, program, worldData } = useWorldContext();

  const onBannerClick = useCallback<(a: BannerInfo) => Promise<void>>(
    async (info) => {
      if (!program || !publicKey || !worldData) {
        return;
      }

      const nftMintKp = Keypair.generate();

      await program.methods
        .mintCharacter()
        .accountsStrict({
          minter: minterAddress({
            programId: program.programId,
            world: info.data.world,
          }),
          payer: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          characterMint: nftMintKp.publicKey,
          characterToken: getAssociatedTokenAddressSync(
            nftMintKp.publicKey,
            publicKey
          ),
          metadata: PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata', 'utf-8'),
              mpl.PROGRAM_ID.toBuffer(),
              nftMintKp.publicKey.toBuffer(),
            ],
            mpl.PROGRAM_ID
          )[0],
          masterEdition: PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata', 'utf-8'),
              mpl.PROGRAM_ID.toBuffer(),
              nftMintKp.publicKey.toBuffer(),
              Buffer.from('edition', 'utf-8'),
            ],
            mpl.PROGRAM_ID
          )[0],
          rent: SYSVAR_RENT_PUBKEY,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          metadataProgram: mpl.PROGRAM_ID,
          banner: info.address,
          character: characterAddress({
            programId: program.programId,
            nftMint: nftMintKp.publicKey,
          }),
          world: info.data.world,
          owner: publicKey,
          summoniteMint: worldData.summoniteMint,
          summoniteSource: getAssociatedTokenAddressSync(
            worldData.summoniteMint,
            publicKey
          ),
          charactersCollection: worldData.charactersCollection,
          charactersCollectionMetadata: PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata', 'utf-8'),
              mpl.PROGRAM_ID.toBuffer(),
              worldData.charactersCollection.toBuffer(),
            ],
            mpl.PROGRAM_ID
          )[0],
          charactersCollectionMasterEdition: PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata', 'utf-8'),
              mpl.PROGRAM_ID.toBuffer(),
              worldData.charactersCollection.toBuffer(),
              Buffer.from('edition', 'utf-8'),
            ],
            mpl.PROGRAM_ID
          )[0],
          recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        })
        .preInstructions([
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 1000000,
          }),
        ])
        .signers([nftMintKp])
        .rpc();
    }, [program, publicKey, worldData]);


  useEffect(() => {
    if (banners) {
      const scene = Game.raw.scenes['lobby'] as Lobby;
      scene.syncBanners(banners);
      for (const b of scene.banners) {
        b.clickCallback = onBannerClick;
      }
    }
  }, [banners, program, onBannerClick]);


  return (
    <>{active ? <div id="root-ui" className='container'>
      <WalletMultiButton />
      {' '}
      <Button variant="contained" onClick={gotoCharacters}>Characters</Button>
      {' '}
      <Button variant="contained" onClick={gotoItems}>Items</Button>
      {' '}
      <Button variant="contained" onClick={gotoBattles}>Battles</Button>
      <br />
      <br />
      <Energy />
      <br />
      <Summonite />
      <br />
    </div > : ''}</>
  );
};

export default LobbyUi;