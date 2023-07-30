import { Button } from "@mui/material";
import { FC, useCallback } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Game from "../Game";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useUserContext } from "../hooks/UserContext";

const Summonite: FC = () => {
    const { summoniteBalance } = useUserContext();

    const goAddSummonite = useCallback(() => {
        Game.raw.goToScene('addSummonite');
    }, []);
    const goRemoveSummonite = useCallback(() => {
        Game.raw.goToScene('removeSummonite');
    }, []);

    return <div>
        Summonite: {summoniteBalance === null ? <RefreshIcon /> : summoniteBalance}
        {' '}
        <Button variant="contained" onClick={goAddSummonite}>
            <AddIcon />
        </Button>
        {' '}
        <Button variant="contained" onClick={goRemoveSummonite}>
            <RemoveIcon />
        </Button>
    </div>
}

export default Summonite;