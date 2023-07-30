/* eslint-disable react-refresh/only-export-components */
import { AnchorProvider, IdlAccounts, Program } from "@coral-xyz/anchor";
import { FC, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Advensum, IDL } from '../../../../target/types/advensum';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Game from "../Game";

export type WorldData = IdlAccounts<Advensum>['world'];
export type BannerData = IdlAccounts<Advensum>['banner'];

export interface WorldInfo {
  program: Program<Advensum> | null;
  worldPk: PublicKey;
  worldData: WorldData | null;
  banners: BannerData[] | null;
}

export const WorldContext = createContext<WorldInfo>({
  program: null,
  worldPk: Game.raw.world,
  worldData: null,
  banners: null,
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

    return new Program<Advensum>(IDL, new PublicKey('advsQ6WNSh5Fvsf1FxtLwFUV4ibxFa3GiF4Ko9zn5Ww'), provider);
  }, [connection, signTransaction, signAllTransactions, publicKey]);

  const [worldData, setWorldData] = useState<WorldData | null>(null);
  useEffect(() => {
    (async () => {
      const v = await program.account.world.fetch(Game.raw.world);
      setWorldData(v);
    })();
  }, [program]);

  const [banners, setBanners] = useState<BannerData[] | null>(null);
  useEffect(() => {
    (async () => {
      const v = (await program.account.banner.all(Game.raw.world.toBuffer())).map(v => v.account);
      v.sort((a, b) => a.index.toNumber() - b.index.toNumber());
      setBanners(v);
    })();
  }, [program])

  const world = useMemo<WorldInfo>(() => ({
    program,
    worldPk: Game.raw.world,
    worldData,
    banners,
  }), [program, worldData, banners]);

  return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
}