import {
  Cluster,
  clusterApiUrl,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import { Advensum, IDL } from "../../../target/types/advensum";
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

export interface Context {
  provider: AnchorProvider;
  program: Program<Advensum>;
  command: string;
}

let context: Context | null = null;

export const setContext = ({
  cluster,
  programId,
  walletKP,
  skipPreflight,
  commitment = 'confirmed',
  command,
}: {
  cluster: string;
  programId: PublicKey;
  walletKP: Keypair;
  skipPreflight: boolean;
  commitment?: Commitment;
  command: string;
}) => {
  try {
    cluster = clusterApiUrl(cluster as Cluster);
  } catch (e) {
    // ignore
  }

  const wallet = new NodeWallet(walletKP);

  const provider = new AnchorProvider(
    new Connection(cluster, {
      commitment,
    }),
    wallet,
    {
      skipPreflight,
      commitment,
    }
  );

  const program = new Program(IDL, programId, provider);

  context = {
    provider,
    program,
    command
  };
};

export const useContext = () => {
  if (!context) {
    throw new Error('Set context before using it')
  }
  return context!;
};
