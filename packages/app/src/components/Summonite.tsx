import { Button } from "@mui/material";
import { FC, useCallback } from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Game from "../Game";

const Summonite: FC = () => {
    const goAddSummonite = useCallback(() => {
        Game.raw.goToScene('addSummonite');
    }, []);
    const goRemoveSummonite = useCallback(() => {
        Game.raw.goToScene('removeSummonite');
    }, []);

    return <div>
        Summonite: 100
        <Button variant="contained" onClick={goAddSummonite}>
            <AddIcon />
        </Button>
        <Button variant="contained" onClick={goRemoveSummonite}>
            <RemoveIcon />
        </Button>
    </div>
}

export default Summonite;