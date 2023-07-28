import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@mui/material';

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

  const gotoCharacters = useCallback(() => {
    Game.raw.goToScene('characters');
  }, []);

  const gotoItems = useCallback(() => {
    Game.raw.goToScene('items')
  }, []);

  const gotoBattles = useCallback(() => {
    Game.raw.goToScene('battles')
  }, []);

  return (
    <>{active ? <div id="root-ui" className='container'>
      <WalletMultiButton />
      <br/>
      <Button variant="contained" onClick={gotoCharacters}>Characters</Button>
      <br/>
      <Button variant="contained" onClick={gotoItems}>Items</Button>
      <br/>
      <Button variant="contained" onClick={gotoBattles}>Battles</Button>
    </div > : ''}</>
  );
};

export default LobbyUi;