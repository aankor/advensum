import { Command } from "commander";
import { useContext } from "../context";
import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { parseKeypair, parsePubkey } from "../keyParser";
import { executeTx } from "../executeTx";
import { minterAddress } from "../pdas";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

export function installInitWorld(program: Command) {
    program
        .command('init-world')
        .option('--world <keypair>', 'Root address keypair (default: random)')
        .option('--admin <pubkey>', 'Admin (default: wallet key)')
        .option('--treasury <pubkey>', 'Treasury account', 'EDeLiDE13GryiKDFcjjWHdeg2VKqJTRKUstWMeTXZv3D')
        .option('--energy <mint>', 'Energy mint keypair (default: random)')
        .option('--summonite <mint>', 'Summonite mint keypair (default: random)')
        .option('-s, --simulate', 'Simulate')
        .option('--print <format>', 'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats')
        .action(processInitWorld)
}

async function processInitWorld({
    world,
    admin,
    treasury,
    energy,
    summonite,
    print,
    simulate = false,
}: {
    world?: string;
    admin?: string;
    treasury: string;
    energy?: string;
    summonite?: string;
    print?: string;
    simulate?: boolean;
}) {
    const { program, provider } = useContext();

    const signers: Keypair[] = [];

    let worldKp: Keypair;
    if (world) {
      worldKp = await parseKeypair(world);
    } else {
      worldKp = Keypair.generate();
      console.log(`Generating world address ${worldKp.publicKey.toBase58()}`);
    }

    const adminPk = admin ? await parsePubkey(admin) : provider.wallet.publicKey;

    const treasuryPk = await parsePubkey(treasury);

    let energyKp: Keypair;
    if (energy) {
      energyKp = await parseKeypair(energy);
    } else {
      energyKp = Keypair.generate();
      console.log(`Generating energy mint ${energyKp.publicKey.toBase58()}`);
    }

    let summoniteKp: Keypair;
    if (summonite) {
      summoniteKp = await parseKeypair(summonite);
    } else {
      summoniteKp = Keypair.generate();
      console.log(`Generating summonite mint ${summoniteKp.publicKey.toBase58()}`);
    }


    const builder = program.methods.initWorld(adminPk)
    .accountsStrict({
      world: worldKp.publicKey,
      minter: minterAddress({
        programId: program.programId,
        world: worldKp.publicKey,
      }),
      treasury: treasuryPk,
      energyMint: energyKp.publicKey,
      summoniteMint: summoniteKp.publicKey,
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([
      worldKp,
      energyKp,
      summoniteKp,
    ]);

    await executeTx({
        provider,
        builder,
        print,
        simulate,
    })
}