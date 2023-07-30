import { useState, type FC, useEffect, useCallback } from 'react';
import Game from '../../Game';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUserContext } from '../../hooks/UserContext';
import CharactersScene from './scene';

const CharactersUi: FC = () => {
  const { characters } = useUserContext();

  const [active, setActive] = useState(false);

  useEffect(
    () => {
      const activateHandler = () => {
        setActive(true);
      };
      Game.raw.scenes['characters'].on('activate', activateHandler);

      const deactivateHandler = () => {
        setActive(false);
      }
      Game.raw.scenes['characters'].on('deactivate', deactivateHandler);


      () => {
        Game.raw.scenes['characters'].off('activate', activateHandler);
        Game.raw.scenes['characters'].off('deactivate', deactivateHandler);
      }
    },
    [setActive]);

  const goBack = useCallback(() => {
    Game.raw.goToScene('lobby');
  }, []);

  useEffect(() => {
    if (characters) {
      const scene = Game.raw.scenes['characters'] as CharactersScene;
      scene.syncCharacters(characters);
    }
  }, [characters])

  return (
    <>{active ? <div id="root-ui" className='container'>
      <Button variant="contained" onClick={goBack}><ArrowBackIcon /></Button>
    </div > : ''}</>
  );
};

export default CharactersUi;