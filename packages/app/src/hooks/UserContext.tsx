import { FC, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { useWorldContext } from "./WorldContext";
import { unpackAccount } from '@solana/spl-token';

export interface UserInfo {
  energyBalance: number | null;
  summoniteBalance: number | null;
}

export const UserContext = createContext<UserInfo>({
  energyBalance: null,
  summoniteBalance: null,
});

export const useUserContext = () => {
  return useContext(UserContext);
}

export const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { worldData } = useWorldContext();

  const [energyBalance, setEnergyBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!publicKey || !worldData) {
      return;
    }
    const tokenAccount = getAssociatedTokenAddressSync(worldData.energyMint, publicKey);
    let alreadySet = false;
    const handler = connection.onAccountChange(tokenAccount, (acc) => {
      const { amount } = unpackAccount(tokenAccount, acc);
      setEnergyBalance(Number(amount));
      alreadySet = true;
    });
    (async () => {
      try {
        const v = await connection.getTokenAccountBalance(tokenAccount);
        if (!alreadySet) {
          setEnergyBalance(parseFloat(v.value.amount));
        }
      } catch (e) {
        if ((e as Error).message === 'failed to get token account balance: Invalid param: could not find account') {
          if (!alreadySet) {
            setEnergyBalance(0);
          }
        } else {
          throw e;
        }
      }

    })();
    return () => {
      connection.removeAccountChangeListener(handler);
    };
  }, [connection, publicKey, worldData]);

  const [summoniteBalance, setSummoniteBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!publicKey || !worldData) {
      return;
    }
    const tokenAccount = getAssociatedTokenAddressSync(worldData.summoniteMint, publicKey!);
    let alreadySet = false;
    const handler = connection.onAccountChange(tokenAccount, (acc) => {
      const { amount } = unpackAccount(tokenAccount, acc);
      setSummoniteBalance(Number(amount));
      alreadySet = true;
    });
    (async () => {
      try {
        const v = await connection.getTokenAccountBalance(tokenAccount);
        if (!alreadySet) {
          setSummoniteBalance(parseFloat(v.value.amount));
        }
      } catch (e) {
        if ((e as Error).message === 'failed to get token account balance: Invalid param: could not find account') {
          if (!alreadySet) {
            setSummoniteBalance(0);
          }
        } else {
          throw e;
        }
      }
    })();
    return () => {
      connection.removeAccountChangeListener(handler);
    };
  }, [connection, publicKey, worldData]);

  const user = useMemo<UserInfo>(() => ({
    energyBalance,
    summoniteBalance
  }), [energyBalance, summoniteBalance])

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}