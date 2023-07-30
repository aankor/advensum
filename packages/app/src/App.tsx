import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import type { FC, ReactNode } from 'react';
import { createContext, useEffect, useMemo } from 'react';
import Game from './Game';
import RootUi from './scenes/root/ui';
import LobbyUi from './scenes/lobby/ui';
import CharactersUi from './scenes/characters/ui';
import ItemsUi from './scenes/items/ui';
import BattlesUi from './scenes/battles/ui';
import AddEnergyUi from './scenes/addEnergy/ui';
import RemoveEnergyUi from './scenes/removeEnergy/ui';
import AddSummoniteUi from './scenes/addSummonite/ui';
import RemoveSummoniteUi from './scenes/removeSummonite/ui';
import { WorldContextProvider } from './hooks/WorldContext';
import { UserContextProvider } from './hooks/UserContext';
import CharacterUpgradeUi from './scenes/characterUpgrade/ui';

const App: FC = () => {
  return (
    <OuterContext>
      <RootUi />
      <LobbyUi />
      <CharactersUi />
      <ItemsUi />
      <BattlesUi />
      <AddEnergyUi />
      <RemoveEnergyUi />
      <AddSummoniteUi />
      <RemoveSummoniteUi />
      <CharacterUpgradeUi />
    </OuterContext >
  );
};

export default App;


const OuterContext: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  useEffect(() => {
    Game.instance();
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]}>
        <WalletDialogProvider>
          <WorldContextProvider>
            <UserContextProvider>
              {children}
            </UserContextProvider>
          </WorldContextProvider>
        </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};