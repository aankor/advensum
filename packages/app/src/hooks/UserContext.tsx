/* eslint-disable react-refresh/only-export-components */
import { FC, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { useWorldContext } from "./WorldContext";
import { unpackAccount } from '@solana/spl-token';
import { IdlAccounts } from "@coral-xyz/anchor";
import { Advensum } from '../../../../target/types/advensum';
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { ParsedAccountData, PublicKey } from "@solana/web3.js";
import { characterAddress } from "../pdas";
import * as mpl from '@metaplex-foundation/mpl-token-metadata';

export type CharacterData = IdlAccounts<Advensum>['character'];

export interface CharacterInfo {
  data: CharacterData,
  metadataUrl: string,
  image: string,
}

export interface UserInfo {
  energyBalance: number | null;
  summoniteBalance: number | null;
  characters: CharacterInfo[] | null;
}

export const UserContext = createContext<UserInfo>({
  energyBalance: null,
  summoniteBalance: null,
  characters: null,
});

export const useUserContext = () => {
  return useContext(UserContext);
}

export const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { worldData, program } = useWorldContext();

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

  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    setInterval(() => {
      console.log('Must update');
      setTime(Date.now())
    }, 10000)
  }, [setTime]);

  const [characters, setCharacters] = useState<CharacterInfo[] | null>(null);

  useEffect(() => {
    if (!publicKey || !program) {
      return;
    }
    (async () => {
      console.log('Updating');
      const tokens = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: 165,
            },
            {
              memcmp: {
                offset: 32,
                bytes: publicKey.toBase58(),
              }
            }
          ]
        }
      );
      const characters: CharacterInfo[] = [];
      for (const token of tokens) {
        if ((token.account.data as ParsedAccountData).parsed.info
          .tokenAmount.amount === '1') {
          const nftMint = new PublicKey((token.account.data as ParsedAccountData)
            .parsed.info.mint);
          try {
            const characterData = await program.account.character.fetch(
              characterAddress({
                programId: program.programId,
                nftMint
              })
            );
            const metadata = await mpl.Metadata.fromAccountAddress(
              connection,
              PublicKey.findProgramAddressSync(
                [
                  Buffer.from('metadata', 'utf-8'),
                  mpl.PROGRAM_ID.toBuffer(),
                  nftMint.toBuffer(),
                ],
                mpl.PROGRAM_ID
              )[0]
            );
            const metadataJson = await (await fetch(metadata.data.uri)).json();
            characters.push({
              data: characterData,
              metadataUrl: metadata.data.uri,
              image: metadataJson.image
            });
          }
          catch (e) {
            //
          }
        }
      }
      characters.sort((a, b) => b.data.level.toNumber() - a.data.level.toNumber())
      setCharacters(characters);
    })();
  }, [connection, program, publicKey, setCharacters, time]);

  const user = useMemo<UserInfo>(() => ({
    energyBalance,
    summoniteBalance,
    characters,
  }), [energyBalance, summoniteBalance, characters]);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}