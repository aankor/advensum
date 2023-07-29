import { WalletMultiButton } from '@solana/wallet-adapter-material-ui';
import { useState, type FC, useEffect, useCallback, ChangeEvent } from 'react';
import Game from '../../Game';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useWorldContext } from '../../hooks/WorldContext';
import { useUserContext } from '../../hooks/UserContext';
import { AccountInfo, LAMPORTS_PER_SOL, ParsedAccountData, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createSyncNativeInstruction } from '@solana/spl-token'
import RefreshIcon from '@mui/icons-material/Refresh';
import { minterAddress } from '../../pdas';
import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = Buffer;

const AddSummoniteUi: FC = () => {
  const { worldData, worldPk, program } = useWorldContext();
  const { summoniteBalance } = useUserContext();
  let price: number | null = null;
  if (worldData) {
    price = worldData.summonitePrice.toNumber() / LAMPORTS_PER_SOL
  }

  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['addSummonite'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['addSummonite'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['addSummonite'].off('activate', activateHandler);
        Game.raw.scenes['addSummonite'].off('deactivate', deactivateHandler);
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

  const { publicKey } = useWallet();

  const handleBuy = useCallback(() => {
    (async () => {
      if (value > 0 && program && worldData && publicKey) {
        const payment = value * worldData.summonitePrice.toNumber();
        const payFrom = getAssociatedTokenAddressSync(worldData.treasuryMint, publicKey);
        const mintTo = getAssociatedTokenAddressSync(worldData.summoniteMint, publicKey);
        const prepare: TransactionInstruction[] = [];
        let have = 0;
        const payFromInfo = await program.provider.connection.getParsedAccountInfo(payFrom);
        if (payFromInfo.value) {
          have = (payFromInfo.value as AccountInfo<ParsedAccountData>).data.parsed.info
            .tokenAmount.amount;
        } else {
          prepare.push(
            createAssociatedTokenAccountInstruction(
              publicKey,
              payFrom,
              publicKey,
              worldData.treasuryMint,
            )
          );
        }

        const left = payment - have;
        if (left > 0) {
          prepare.push(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: payFrom,
              lamports: left
            })
          );
          prepare.push(
            createSyncNativeInstruction(payFrom)
          )
        }

        if (!(await program.provider.connection.getAccountInfo(mintTo))) {
          prepare.push(
            createAssociatedTokenAccountInstruction(
              publicKey,
              mintTo,
              publicKey,
              worldData.summoniteMint,
            )
          )
        }
        await program.methods
          .mintSummonite(new BN(value))
          .accountsStrict({
            minter: minterAddress({
              programId: program.programId,
              world: worldPk,
            }),
            world: worldPk,
            summoniteMint: worldData.summoniteMint,
            treasury: worldData.treasury,
            payFrom,
            payer: publicKey,
            mintTo,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .preInstructions(prepare)
          .rpc()
      }
    })();
  }, [value, program, worldData, worldPk, publicKey]);

  return (
    <>{active ? <div id="root-ui" className='container'>
      <Button variant="contained" onClick={goBack}><ArrowBackIcon/></Button>
      <br/>
      Price: {price === null ? <RefreshIcon /> : price} SOL/Summonite
      <br/>
      Balance: {summoniteBalance === null ? <RefreshIcon /> : summoniteBalance} Summonite
      <br/>
      <TextField
        id="outlined-basic"
        label="Summonite"
        variant="outlined"
        type="number"
        value={value}
        onChange={onValueChange}
      />
      <Button variant="contained" onClick={handleBuy}>Buy</Button>
    </div > : ''}</>
  );
};

export default AddSummoniteUi;