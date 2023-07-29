import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback, ChangeEvent } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddEnergyUi: FC = () => {
  // const { wallet } = useWallet();

  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['addEnergy'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['addEnergy'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['addEnergy'].off('activate', activateHandler);
        Game.raw.scenes['addEnergy'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  const goBack = useCallback(() => {
    Game.raw.goToScene('lobby');
  }, []);

  const [value, setValue] = useState(0);

  const onValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      let parsed = parseFloat(e.target.value);
      if (parsed < 0) {
        parsed = 0;
      }
      setValue(parsed)
    }
  }, [setValue]);

  const handleBuy = useCallback(() => {
    if (value > 0) {
      alert(`Buying ${value} energy`);
    }
  }, [value]);

  return (
    <>{active ? <div id="root-ui" className='container'>
      <Button variant="contained" onClick={goBack}><ArrowBackIcon/></Button>
      <br/>
      Price: 0.1 SOL/Energy
      <br/>
      Balance: 100 Energy
      <br/>
      <TextField
        id="outlined-basic"
        label="Energy"
        variant="outlined"
        type="number"
        value={value}
        onChange={onValueChange}
      />
      <Button variant="contained" onClick={handleBuy}>Buy</Button>
    </div > : ''}</>
  );
};

export default AddEnergyUi;