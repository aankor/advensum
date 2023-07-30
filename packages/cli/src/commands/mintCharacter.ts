import {Command} from 'commander';
import {useContext} from '../context';
import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {parseKeypair, parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
import {characterAddress, minterAddress} from '../pdas';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import {getAssociatedTokenAddressSync} from '@solana/spl-token';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';

export function installMintCharacter(program: Command) {
  program
    .command('mint-character')
    .option('--nft-mint <keypair>', 'NFT mint keypair (default: random)')
    .requiredOption('--banner <string>', 'Name')
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processMintCharacter);
}

async function processMintCharacter({
  nftMint,
  banner,
  print,
  simulate = false,
}: {
  nftMint?: string;
  banner: string;
  print?: string;
  simulate?: boolean;
}) {
  const {program, provider} = useContext();

  const signers: Keypair[] = [];

  let nftMintKp: Keypair;
  if (nftMint) {
    nftMintKp = await parseKeypair(nftMint);
  } else {
    nftMintKp = Keypair.generate();
    console.log(`Generating NFT mint ${nftMintKp.publicKey.toBase58()}`);
  }
  signers.push(nftMintKp);

  const bannerPk = await parsePubkey(banner);
  const bannerData = await program.account.banner.fetch(bannerPk);
  const worldData = await program.account.world.fetch(bannerData.world);

  const builder = program.methods
    .mintCharacter()
    .accountsStrict({
      minter: minterAddress({
        programId: program.programId,
        world: bannerData.world,
      }),
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      characterMint: nftMintKp.publicKey,
      characterToken: getAssociatedTokenAddressSync(
        nftMintKp.publicKey,
        provider.publicKey!
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
      banner: bannerPk,
      character: characterAddress({
        programId: program.programId,
        nftMint: nftMintKp.publicKey,
      }),
      world: bannerData.world,
      owner: provider.publicKey!,
      summoniteMint: worldData.summoniteMint,
      summoniteSource: getAssociatedTokenAddressSync(
        worldData.summoniteMint,
        provider.publicKey!
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
    })
    .preInstructions([
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
      }),
    ])
    .signers(signers);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
