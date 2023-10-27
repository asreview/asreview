import { useEffect, useState, useCallback} from "react";

import { Grid, Paper, Stack, Box, Switch, FormControlLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasBalloons from "../images/ElasBalloons.svg";
import ElasPotter from "../images/ElasPotter.svg";
import ElasArrowRightAhead from "../images/ElasArrowRightAhead.svg";
import ElasConstructionWorkerOrange from "../images/ElasConstructionWorkerOrange.svg";
import ElasArrowLeft from "../images/ElasArrowLeft.svg";
import ElasGrad from "../images/ElasGrad.svg";
import ElasWithDuck from "../images/ElasWithDuck.svg";
import ElasFireMan from "../images/ElasFireMan.svg";

import ElasIcon from "../icons/ElasIcon";

const images = [
  ElasConstructionWorkerOrange,
  ElasFireMan,
  ElasWithDuck,
  ElasBalloons,
  ElasGrad,
  ElasArrowRightAhead,
  ElasPotter,
  ElasArrowLeft,
];

const PREFIX = "Game";

const classes = {
  paper: `${PREFIX}-paper`,
  image: `${PREFIX}-image`,
  icon: `${PREFIX}-icon`,
};

const GameStyle = styled(Box)(({ theme }) => ({
  [`& .${classes.paper}`]: {
    backgroundColor: theme.palette.primary.light,
    height: 120,
    width: 120,
  },
  [`& .${classes.image}`]: {
    objectFit: "scale-down",
    height: 100,
  },
  [`& .${classes.icon}`]: {
    color: "white",
    opacity: 0.6,
    width: "100%",
  },
}));

const ElasGame = (props) => {
  const [mode, setMode] = useState('simple'); // New state for mode
  const [cheatMode, setCheatMode] = useState(false); // New state for cheat mode
  const [imagesArray, setImagesArray] = useState([]);
  const [paperSelected, setPaperSelected] = useState([]);
  const [paperSelectedIds, setPaperSelectedIds] = useState([]);
  const [openCards, setOpenCards] = useState([]);

  // function createElasGrid() {
  //   const imagesGenerated = images?.concat(...images);
  //   const shuffledImages = shuffle(imagesGenerated);
  //   setImagesArray(shuffledImages);
  // }

   // Function to toggle between simple and expert mode
const toggleMode = () => {
    setMode(prevMode => prevMode === 'simple' ? 'expert' : 'simple');
  };

  // New function to handle key press, memoized with useCallback
  const handleKeyPress = useCallback((event) => {
    if (event.key === "c") {
      setCheatMode((prevCheatMode) => !prevCheatMode);
    }
  }, []); 

  function flipImage(image, index) {
    if (paperSelectedIds?.length === 1 && paperSelectedIds[0] === index) {
      return;
    }

    if (paperSelected?.length < 2) {
      setPaperSelected((paperSelected) => paperSelected?.concat(image));
      setPaperSelectedIds((paperSelectedIds) =>
        paperSelectedIds?.concat(index),
      );

      if (paperSelected?.length === 1) {
        if (paperSelected[0] === image) {
          setOpenCards((openCards) =>
            openCards?.concat([paperSelected[0], image]),
          );
        }
        setTimeout(() => {
          setPaperSelectedIds([]);
          setPaperSelected([]);
        }, 700);
        props.addAttempt();
      }
    }
  }

  function isCardChosen(image, index) {
    return paperSelectedIds?.includes(index) || openCards?.includes(image);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  useEffect(() => {
    const imagesToUse = mode === 'simple' ? images.slice(0, 4) : images; // Choose first 4 for simple, all for expert
    const imagesGenerated = imagesToUse.concat(...imagesToUse);
    const shuffledImages = shuffle(imagesGenerated);
    setImagesArray(shuffledImages);

// Add event listener for key press
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, mode]);


  return (
    <GameStyle>
        <FormControlLabel
      control={
        <Switch
          checked={mode === 'expert'}
          onChange={toggleMode}
          name="mode"
          color="primary"
        />
      }
      label="Expert Mode"
    />
        <Grid container justifyContent="center" spacing={2}>
        {imagesArray?.map((image, index) => (
          <Grid key={index} item>
            <Paper
              key={index}
              onClick={() => flipImage(image, index)}
              className={classes.paper}
              component={Stack}
              direction="column"
              justifyContent="center"
            >
              {isCardChosen(image, index) || (cheatMode && !openCards.includes(image)) ? (
                <img src={image} alt="" className={classes.image} />
              ) : (
                <ElasIcon sx={{ fontSize: 100 }} className={classes.icon} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </GameStyle>
  );
};

export default ElasGame;
