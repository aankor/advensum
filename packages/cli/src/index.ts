import { Command } from 'commander';
import { parseKeypair, parsePubkey } from './keyParser';
import { setContext } from './context';
import { installCommands } from './commands';

const program = new Command();

program
    .version('0.0.1')
    .allowExcessArguments(false)
    .option('-c, --cluster <cluster>', 'Solana cluster', 'https://api.devnet.rpcpool.com/82424375-773e-4bc1-8169-2053be5f5b5d')
    .option(
        '--program-id <program-id>',
        'program ID',
        'advsQ6WNSh5Fvsf1FxtLwFUV4ibxFa3GiF4Ko9zn5Ww')
    .option('--commitment <commitment>', 'Commitment', 'confirmed')
    .option(
        '-k, --keypair <keypair>', 'Wallet keypair', '~/.config/solana/id.json')
    .option(
        '--skip-preflight',
        'setting transaction execution flag "skip-preflight"',
        false
    )
    .hook('preAction', async (command: Command, action: Command) => {
        setContext({
            cluster: command.opts().cluster,
            programId: await parsePubkey(command.opts().programId),
            walletKP: await parseKeypair(command.opts().keypair),
            skipPreflight: Boolean(command.opts().skipPreflight),
            commitment: command.opts().commitment,
            command: action.name(),
        });
    });

installCommands(program);

program.parseAsync(process.argv).then(
    () => process.exit(),
    (err: unknown) => {
        console.error(err);
        process.exit(-1);
    }
);