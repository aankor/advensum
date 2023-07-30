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
import { BN } from '@coral-xyz/anchor';

export function installInitBanner(program: Command) {
  program
    .command('init-banner')
    .option(
      '--world <pubkey>',
      'World address',
      '3TVtzmya5YMsEu4JRP5njkpmDrWst5ad4XXhwfdWU69m'
    )
    .option('--admin <keypair>', 'Admin (default: wallet key)')
    .option(
      '--banner <keypair>',
      'Banner keypair (default: random)'
    )
    .requiredOption('--name <string>', 'Name')
    .requiredOption('--image <string>', 'Image')
    .requiredOption('--summonite-cost <number>', 'Summonite cost', parseFloat)
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processInitBanner);
}

async function processInitBanner({
  world,
  admin,
  banner,
  name,
  image,
  summoniteCost,
  print,
  simulate = false,
}: {
  world: string;
  admin?: string;
  banner?: string;
  name: string;
  image: string;
  summoniteCost: number;
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

  let bannerKp: Keypair;
  if (banner) {
    bannerKp = await parseKeypair(banner);
  } else {
    bannerKp = Keypair.generate();
    console.log(
      `Generating banner ${bannerKp.publicKey.toBase58()}`
    );
  }
  signers.push(bannerKp);

  const builder = program.methods
    .initBanner(name, image, new BN(summoniteCost))
    .accountsStrict({
      world: worldPk,
      banner: bannerKp.publicKey,
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      admin: adminPk,
    })
    .signers(signers);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
