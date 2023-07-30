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

export function installAddBannerItem(program: Command) {
  program
    .command('add-banner-item')
    .requiredOption(
      '--banner <pubkey>',
      'Banner address',
    )
    .option('--admin <keypair>', 'Admin (default: wallet key)')
    .requiredOption('--name <string>', 'Name')
    .requiredOption('--uri <string>', 'Uri')
    .requiredOption('--probability <number>', 'probability', parseFloat)
    .requiredOption('--min-hp <number>', 'Min hp', parseFloat)
    .requiredOption('--max-hp <number>', 'Max hp', parseFloat)
    .requiredOption('--min-attack <number>', 'Min attack', parseFloat)
    .requiredOption('--max-attack <number>', 'Max attack', parseFloat)
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processAddBannerItem);
}

async function processAddBannerItem({
  admin,
  banner,
  name,
  uri,
  probability,
  minHp,
  maxHp,
  minAttack,
  maxAttack,
  print,
  simulate = false,
}: {
  admin?: string;
  banner: string;
  name: string;
  uri: string,
  probability: number,
  minHp: number;
  maxHp: number;
  minAttack: number;
  maxAttack: number;
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

  const bannerPk = await parsePubkey(banner);
  const bannerData = await program.account.banner.fetch(bannerPk);

  const builder = program.methods
    .addBannerItem(name, uri, probability, minHp, maxHp, minAttack, maxAttack)
    .accountsStrict({
      world: bannerData.world,
      admin: adminPk,
      banner: bannerPk,
    })
    .signers(signers);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
