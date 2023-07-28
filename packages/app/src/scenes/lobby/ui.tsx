import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';

const LobbyUi: FC = () => {
  const { wallet } = useWallet();
  const handleDisconnect = useCallback(() => {
    Game.raw.goToScene('root');
  }, []);

  useEffect(() => {
    wallet?.adapter.on('disconnect', handleDisconnect);

    return () => {
      wallet?.adapter.off('disconnect', handleDisconnect)
    }
  }, [wallet, handleDisconnect]);
  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['lobby'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['lobby'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['lobby'].off('activate', activateHandler);
        Game.raw.scenes['lobby'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  return (
    <>{active ? <div id="root-ui" className='container'>
      <WalletMultiButton />
    </div > : ''}</>
  );
};

export default LobbyUi;