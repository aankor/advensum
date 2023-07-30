import {Command} from 'commander';
import {useContext} from '../context';
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {parseKeypair, parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
import {minterAddress} from '../pdas';
import {ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID} from '@coral-xyz/anchor/dist/cjs/utils/token';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';

export function installSetCharactersCollection(program: Command) {
  program
    .command('set-characters-collection')
    .option(
      '--world <pubkey>',
      'World address',
      '3TVtzmya5YMsEu4JRP5njkpmDrWst5ad4XXhwfdWU69m'
    )
    .option('--admin <keypair>', 'Admin (default: wallet key)')
    .option(
      '--collection <keypair>',
      'Collection mint keypair (default: random)'
    )
    .requiredOption('--name <string>', 'Name')
    .requiredOption('--symbol <string>', 'Symbol')
    .requiredOption('--uri <string>', 'Uri')
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processSetCharactersCollection);
}

async function processSetCharactersCollection({
  world,
  admin,
  collection,
  name,
  symbol,
  uri,
  print,
  simulate = false,
}: {
  world: string;
  admin?: string;
  collection?: string;
  name: string;
  symbol: string;
  uri: string;
  print?: string;
  simulate?: boolean;
}) {
  const {program, provider} = useContext();

  const signers: Keypair[] = [];

  let adminPk = provider.wallet.publicKey;
  if (admin) {
    const adminKp = await parseKeypair(admin);
    signers.push(adminKp);
    adminPk = adminKp.publicKey;
  }

  const worldPk = await parsePubkey(world);

  let collectionKp: Keypair;
  if (collection) {
    collectionKp = await parseKeypair(world);
  } else {
    collectionKp = Keypair.generate();
    console.log(
      `Generating collection mint ${collectionKp.publicKey.toBase58()}`
    );
  }
  signers.push(collectionKp);

  const builder = program.methods
    .setCharactersCollection(name, symbol, uri)
    .accountsStrict({
      world: worldPk,
      minter: minterAddress({
        programId: program.programId,
        world: worldPk,
      }),
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      admin: adminPk,
      collectionMint: collectionKp.publicKey,
      collectionToken: getAssociatedTokenAddressSync(collectionKp.publicKey, adminPk),
      metadata: PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata', 'utf-8'),
          mpl.PROGRAM_ID.toBuffer(),
          collectionKp.publicKey.toBuffer(),
        ],
        mpl.PROGRAM_ID,
      )[0],
      masterEdition: PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata', 'utf-8'),
          mpl.PROGRAM_ID.toBuffer(),
          collectionKp.publicKey.toBuffer(),
          Buffer.from('edition', 'utf-8'),
        ],
        mpl.PROGRAM_ID,
      )[0],
      rent: SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      metadataProgram: mpl.PROGRAM_ID,
    })
    .signers(signers);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
