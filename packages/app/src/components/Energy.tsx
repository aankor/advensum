import { Button } from "@mui/material";
import { FC, useCallback } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Game from "../Game";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useUserContext } from "../hooks/UserContext";

const Energy: FC = () => {
  const { energyBalance } = useUserContext();

  const goAddEnergy = useCallback(() => {
    Game.raw.goToScene('addEnergy');
  }, []);
  const goRemoveEnergy = useCallback(() => {
    Game.raw.goToScene('removeEnergy');
  }, []);

  return <div>
    Energy: {energyBalance === null ? <RefreshIcon /> : energyBalance}
    {' '}
    <Button variant="contained" onClick={goAddEnergy}>
      <AddIcon />
    </Button>
    {' '}
    <Button variant="contained" onClick={goRemoveEnergy}>
      <RemoveIcon />
    </Button>
  </div>
}

export default Energy;