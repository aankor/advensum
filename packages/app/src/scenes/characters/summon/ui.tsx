import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../../Game';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SummonUi: FC = () => {
  // const { wallet } = useWallet();

  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['summon'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['summon'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['summon'].off('activate', activateHandler);
        Game.raw.scenes['summon'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

    const goBack = useCallback(() => {
      Game.raw.goToScene('characters');
    }, []);
  
    return (
      <>{active ? <div id="root-ui" className='container'>
        <Button variant="contained" onClick={goBack}><ArrowBackIcon /></Button>
        Summon
      </div > : ''}</>
    );
};

export default SummonUi;