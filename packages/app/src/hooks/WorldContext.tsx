import { AnchorProvider, IdlAccounts, Program } from "@coral-xyz/anchor";
import { FC, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Advensum, IDL } from '../../../../target/types/advensum';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Game from "../Game";

export type WorldData = IdlAccounts<Advensum>['world'];

export interface WorldInfo {
  program: Program<Advensum> | null;
  worldPk: PublicKey;
  worldData: WorldData | null;
} 

export const WorldContext = createContext<WorldInfo>({
  program: null,
  worldPk: Game.raw.world,
  worldData: null,
});

export const useWorldContext = () => {
  return useContext(WorldContext);
}

export const WorldContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { signTransaction, signAllTransactions, publicKey } = useWallet();
  const program = useMemo(() => {
    const provider = new AnchorProvider(
      connection,
      {
        signTransaction: signTransaction!,
        signAllTransactions: signAllTransactions!,
        publicKey: publicKey!,
      },
      AnchorProvider.defaultOptions(),
    );

    return new Program<Advensum>(IDL, new PublicKey('advsL9SKEkFZT5XipM78A8Y2bUomYWf9dvLJWBEzrn1'), provider);
  }, [connection, signTransaction, signAllTransactions, publicKey]);

  const [worldData, setWorldData] = useState<WorldData | null>(null);
  useEffect(() => {
    (async () => {
      const v = await program.account.world.fetch(Game.raw.world);
      setWorldData(v);
    })();
  }, [program]);

  const world = useMemo<WorldInfo>(() => ({
    program,
    worldPk: Game.raw.world,
    worldData,
  }), [program, worldData]);

  return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
}