import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasBalloons from "../images/ElasBalloons.svg";
import ElasPotter from "../images/ElasPotter.svg";
import ElasArrowRightAhead from "../images/ElasArrowRightAhead.svg";
import ElasConstructionWorkerOrange from "../images/ElasConstructionWorkerOrange.svg";
import ElasArrowLeft from "../images/ElasArrowLeft.svg";
import ElasGrad from "../images/ElasGrad.svg";
import ElasWithDuck from "../images/ElasWithDuck.svg";
import ElasFireMan from "../images/ElasFireMan.svg";
import ElasPad from "../images/ElasPad.svg";
import ElasFinished from "../images/ElasFinished.svg";
import ElasRelevanceRanking from "../images/ElasRelevanceRanking.svg";
import ElasConstructionWorkerYellow from "../images/ElasConstructionWorkerYellow.svg";
import Elasiscold from "../images/Elasiscold.svg";
import SantaElas from "../images/SantaElas.svg";
import ElasPlayingRugby from "../images/ElasPlayingRugby.svg";
import ElasPlayingTennis from "../images/ElasPlayingTennis.svg";
import ElasasSuperHero from "../images/ElasSuperHero.svg";
import ElasLion from "../images/ElasLion.svg";
import ElasLollypop from "../images/ElasLollypop.svg";
import ElasUnicorn from "../images/ElasUnicorn.svg";
import ElasWinter from "../images/ElasWinter.svg";

import ElasIcon from "../icons/ElasIcon";

const images = [
  ElasConstructionWorkerOrange,
  ElasFireMan,
  ElasWithDuck,
  ElasGrad,
  ElasArrowRightAhead,
  ElasPotter,
  ElasArrowLeft,
  ElasPad,
  ElasFinished,
  ElasRelevanceRanking,
  ElasConstructionWorkerYellow,
  ElasPlayingRugby,
  ElasPlayingTennis,
  ElasasSuperHero,
  Elasiscold,
  SantaElas,
  ElasLion,
  ElasLollypop,
  ElasUnicorn,
  ElasWinter
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

function shuffleImages(images) {
  let shuffledImages = [...images];
  for (let i = shuffledImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledImages[i], shuffledImages[j]] = [
      shuffledImages[j],
      shuffledImages[i],
    ];
  }
  return shuffledImages;
}

const initialShuffle = (mode) => {
  const imagesToUse = mode === "simple" ? images.slice(0, 8) : images;
  const duplicatedImages = imagesToUse.concat(imagesToUse);
  return shuffleImages(duplicatedImages);
};

const ElasGame = (props) => {
  const [mode, setMode] = useState("simple");
  const [cheatMode, setCheatMode] = useState(false);
  const [paperSelected, setPaperSelected] = useState([]);
  const [paperSelectedIds, setPaperSelectedIds] = useState([]);
  const [openCards] = useState([]);
  const [showingCheatCards, setShowingCheatCards] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [simpleModeOpenCards, setSimpleModeOpenCards] = useState([]);
  const [expertModeOpenCards, setExpertModeOpenCards] = useState([]);
  const [simpleModeAttempts, setSimpleModeAttempts] = useState(0);
  const [expertModeAttempts, setExpertModeAttempts] = useState(0);
  const [simpleModeMatches, setSimpleModeMatches] = useState(0);
  const [expertModeMatches, setExpertModeMatches] = useState(0);
  const [canToggleCheatMode, setCanToggleCheatMode] = useState(true);
  const [imagesArray, setImagesArray] = useState([]);
  const [isExpertCompleted, setIsExpertCompleted] = useState(false);

  const [shuffledSimpleImages, setShuffledSimpleImages] = useState(() =>
    initialShuffle("simple"),
  );
  const [shuffledExpertImages, setShuffledExpertImages] = useState(() =>
    initialShuffle("expert"),
  );

  const toggleMode = () => {
    setMode((prevMode) => {
      if (prevMode === "simple") {
        setImagesArray(shuffledExpertImages);
        return "expert";
      } else {
        setImagesArray(shuffledSimpleImages);
        return "simple";
      }
    });
  };

const resetGame = () => {
  // Close any open cards
  setPaperSelected([]);
  setPaperSelectedIds([]);

  // Reset the score and attempts for the current mode
  if (mode === "simple") {
    // Shuffle only for simple mode
    const shuffledSimple = initialShuffle("simple");
    setShuffledSimpleImages(shuffledSimple);
    setImagesArray(shuffledSimple);

    // Reset simple mode states
    setSimpleModeAttempts(0);
    setSimpleModeMatches(0);
    setSimpleModeOpenCards([]);
  } else {
    // Shuffle only for expert mode
    const shuffledExpert = initialShuffle("expert");
    setShuffledExpertImages(shuffledExpert);
    setImagesArray(shuffledExpert);

    // Reset expert mode states
    setExpertModeAttempts(0);
    setExpertModeMatches(0);
    setExpertModeOpenCards([]);
  }

  // Reset the game state
  setGameStarted(false);
};

const checkExpertCompletion = useCallback(() => {
    if (mode === "expert" && expertModeOpenCards.length === imagesArray.length) {
      setIsExpertCompleted(true);
      setTimeout(() => setIsExpertCompleted(false), 5000);
    }
  }, [mode, expertModeOpenCards.length, imagesArray.length]); 
  useEffect(() => {
    checkExpertCompletion();
  }, [checkExpertCompletion]);

  const handleCompletionDismiss = () => {
    setIsExpertCompleted(false);
  };

  function updateScoreAndAttempts(isMatch) {
    if (mode === "simple") {
      setSimpleModeAttempts((prev) => prev + 1);
      if (isMatch) {
        setSimpleModeMatches((prev) => prev + 1);
      }
    } else {
      setExpertModeAttempts((prev) => prev + 1);
      if (isMatch) {
        setExpertModeMatches((prev) => prev + 1);
      }
    }
  }

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "c" && !cheatMode && canToggleCheatMode) {
        setCheatMode(true);
        setCanToggleCheatMode(false);
      }
    },
    [cheatMode, canToggleCheatMode],
  );

  function flipImage(image, index) {
    const currentModeOpenCards =
      mode === "simple" ? simpleModeOpenCards : expertModeOpenCards;
    const setCurrentModeOpenCards =
      mode === "simple" ? setSimpleModeOpenCards : setExpertModeOpenCards;

    // Check if the clicked card is already matched (open)
    if (currentModeOpenCards.includes(image)) {
      return;
    }

    // Check if the same card is clicked again
    if (paperSelectedIds.includes(index)) {
      return;
    }

    // Check if less than two cards are selected
    if (paperSelected.length < 2) {
      setPaperSelected((prevSelected) => [...prevSelected, image]);
      setPaperSelectedIds((prevIds) => [...prevIds, index]);

      // If two cards are selected, check for a match
      if (paperSelected.length === 1) {
        if (paperSelected[0] === image) {

          // Cards match
          setCurrentModeOpenCards((prevOpenCards) => [
            ...prevOpenCards,
            paperSelected[0],
            image,
          ]);
          setPaperSelected([]);
          setPaperSelectedIds([]);
          updateScoreAndAttempts(true);
        } else {
          setTimeout(() => {
            setPaperSelected([]);
            setPaperSelectedIds([]);
            updateScoreAndAttempts(false);
          }, 700);
        }
      }
    }
  }

  function isCardChosen(image, index) {
    const currentOpenCards =
      mode === "simple" ? simpleModeOpenCards : expertModeOpenCards;
    return currentOpenCards.includes(image);
  }

  useEffect(() => {
    setImagesArray(
      mode === "simple" ? shuffledSimpleImages : shuffledExpertImages,
    );
  }, [mode, shuffledSimpleImages, shuffledExpertImages]);

  useEffect(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [gameStarted]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (cheatMode) {
      setShowingCheatCards(true);

      const hideCheatCardsTimeout = setTimeout(() => {
        setShowingCheatCards(false);
        setCheatMode(false);
        setCanToggleCheatMode(true);
      }, 1000);

      return () => {
        clearTimeout(hideCheatCardsTimeout);
      };
    }
  }, [cheatMode]);



  return (
    <GameStyle>
      <Box
        onClick={handleCompletionDismiss}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={mode === "expert"}
              onChange={toggleMode}
              name="mode"
              color="primary"
              disabled={paperSelected.length === 1}
            />
          }
          label="Expert Mode"
        />

        <Typography variant="h6">
          {mode === "simple"
            ? `Simple Mode: ${simpleModeMatches} correct out of ${simpleModeAttempts}`
            : `Expert Mode: ${expertModeMatches} correct out of ${expertModeAttempts}`}
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={resetGame}
          style={{
            minWidth: "30px",
            height: "30px",
            padding: "0 8px",
            marginRight: "10px",
          }}
        >
          Reset
        </Button>
      </Box>

      {isExpertCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'primary.light',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <img src={ElasBalloons} alt="Celebration Balloons" 
            style={{ width: '100%', maxWidth: '50vw', margin: '0 auto', display: 'block' }} 
            onClick={handleCompletionDismiss}  
            />
          <Typography variant="h4" color="primary" gutterBottom>
            Congratulations! 
            You've completed the Expert Mode!
          </Typography>
        </Box>
      )}

      <Grid container justifyContent="center" spacing={2}>
        {imagesArray?.map((image, index) => (
          <Grid key={index} item>
            <Paper
              onClick={() => flipImage(image, index)}
              className={classes.paper}
              component={Stack}
              direction="column"
              justifyContent="center"
            >
              {isCardChosen(image, index) ||
              paperSelectedIds.includes(index) ||
              (showingCheatCards && !openCards.includes(image)) ? (
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
