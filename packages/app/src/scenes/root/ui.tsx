import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';

const LobbyUi: FC = () => {
  const { wallet } = useWallet();
  
  const handleConnect = useCallback(() => {
    Game.raw.goToScene('lobby');
  }, []);

  useEffect(() => {
    wallet?.adapter.on('connect', handleConnect);

    return () => {
      wallet?.adapter.off('connect', handleConnect)
    }
  }, [wallet, handleConnect]);
  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['root'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['root'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['root'].off('activate', activateHandler);
        Game.raw.scenes['root'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  return (
    <>{active ? <div id="root-ui" className='centered-container'>
      <div className='centered-button'>
        <WalletMultiButton />
      </div>
    </div > : ''}</>
  );
};

export default LobbyUi;