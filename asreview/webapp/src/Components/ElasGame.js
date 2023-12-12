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

// Importing image
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
import SantaElas from "../images/SantaElas.svg";
import ElasPlayingRugby from "../images/ElasPlayingRugby.svg";
import ElasPlayingTennis from "../images/ElasPlayingTennis.svg";
import ElasasSuperHero from "../images/ElasSuperHero.svg";
import ElasLion from "../images/ElasLion.svg";
import ElasLollypop from "../images/ElasLollypop.svg";
import ElasUnicorn from "../images/ElasUnicorn.svg";
import ElasWinter from "../images/ElasWinter.svg";
import ElasAvatar from "../images/ElasAvatar.svg";

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
  SantaElas,
  ElasLion,
  ElasLollypop,
  ElasUnicorn,
  ElasWinter,
  ElasAvatar,
];

// Define a prefix for CSS classes
const PREFIX = "Game";

const classes = {
  paper: `${PREFIX}-paper`,
  image: `${PREFIX}-image`,
  icon: `${PREFIX}-icon`,
};

// Styled component for the game layout
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

// Function to shuffle images for the game
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

// Function to prepare the initial shuffle of images based on game mode
const initialShuffle = (mode) => {
  const imagesToUse = mode === "simple" ? images.slice(0, 8) : images;
  const duplicatedImages = imagesToUse.concat(imagesToUse);
  return shuffleImages(duplicatedImages);
};

// Main component
const ElasGame = (props) => {
  // Define initial state
  const initialState = {
    mode: "simple",
    cheatMode: 'inactive',
    gameStarted: false,
    imagesArraySimple: initialShuffle("simple"),
    imagesArrayExpert: initialShuffle("expert"),
    imagesArray: [],
    isExpertCompleted: false,
    gameStats: {
      simple: { openCards: [], attempts: 0, matches: 0 },
      expert: { openCards: [], attempts: 0, matches: 0 },
    },
    selectedPapers: { images: [], ids: [] },
  };

const [gameState, setGameState] = useState({
    ...initialState,
    imagesArray: initialShuffle("simple"),
  });

  // Resets the game to initial state
const resetGame = () => {
  setGameState(prevState => {
    const resetStats = { openCards: [], attempts: 0, matches: 0 };
    const updatedGameStats = {
      ...prevState.gameStats,
      [prevState.mode]: resetStats,
    };

    return {
      ...prevState,
      gameStats: updatedGameStats,
      selectedPapers: { images: [], ids: [] },
      imagesArray: initialShuffle(prevState.mode),
      isExpertCompleted: false,
    };
  });
};

  // Toggles between simple and expert modes
const toggleMode = () => {
    setGameState(prevState => {
      const newMode = prevState.mode === "simple" ? "expert" : "simple";
      const newImagesArray = newMode === "simple" ? prevState.imagesArraySimple : prevState.imagesArrayExpert;
      return {
        ...prevState,
        mode: newMode,
        imagesArray: newImagesArray,
      };
    });
  };

  const handleCompletionDismiss = useCallback(() => {
    setGameState((prevState) => ({ ...prevState, isExpertCompleted: false }));
  }, []);

  // Function to handle the flip action of a card
  function flipImage(image, index) {
    if (
      gameState.cheatMode === "active" ||
      gameState.selectedPapers.ids.length >= 2
    )
      return;

    const { openCards, attempts, matches } =
      gameState.gameStats[gameState.mode];

    // Ignore click if the same card is clicked again or if the card is already matched
    if (
      gameState.selectedPapers.ids.includes(index) ||
      openCards.includes(image)
    ) {
      return;
    }

    // Add the new card to the selected ones
    const newSelectedPapers = {
      images: [...gameState.selectedPapers.images, image],
      ids: [...gameState.selectedPapers.ids, index],
    };

    setGameState((prevState) => {
      return {
        ...prevState,
        selectedPapers: newSelectedPapers,
      };
    });

    // Check for a match only when two cards are selected
    if (newSelectedPapers.images.length === 2) {
      setTimeout(() => {
        const isMatch =
          newSelectedPapers.images[0] === newSelectedPapers.images[1];

        // Update score and attempts
        const updatedGameStats = {
          ...gameState.gameStats,
          [gameState.mode]: {
            openCards: isMatch
              ? [...openCards, ...newSelectedPapers.images]
              : openCards,
            attempts: attempts + 1,
            matches: isMatch ? matches + 1 : matches,
          },
        };

        setGameState((prevState) => {
          return {
            ...prevState,
            gameStats: updatedGameStats,
            selectedPapers: { images: [], ids: [] },
          };
        });
      }, 700);
    }
  }

  // Function to determine if a card is currently chosen
  function isCardChosen(image, index) {
    const { openCards } = gameState.gameStats[gameState.mode];
    const isSelectedNow = gameState.selectedPapers.ids.includes(index);
    return openCards.includes(image) || isSelectedNow;
  }

  // useEffect hooks
  useEffect(() => {
    // Check if the expert mode is completed
    const { openCards } = gameState.gameStats.expert;
    if (
      gameState.mode === "expert" &&
      openCards.length === gameState.imagesArray.length
    ) {
      setGameState((prevState) => ({
        ...prevState,
        isExpertCompleted: true,
      }));

      const completionTimeout = setTimeout(() => {
        setGameState((prevState) => ({
          ...prevState,
          isExpertCompleted: false,
        }));
      }, 3000);

      return () => clearTimeout(completionTimeout);
    }
  }, [
    gameState.gameStats.expert, gameState.imagesArray.length, gameState.mode]
  );

  // Function to handle key press events
  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "c" && gameState.cheatMode === "inactive") {
        setGameState((prevState) => ({ ...prevState, cheatMode: "active" }));
      }
    },
    [gameState.cheatMode],
  );

  const handleKeyUp = useCallback((event) => {
    if (event.key === "c") {
      setGameState((prevState) => ({ ...prevState, cheatMode: "disabled" }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress, handleKeyUp]);

  useEffect(() => {
    if (gameState.cheatMode === "active") {
    }

    if (gameState.cheatMode === "disabled") {
      setGameState((prevState) => ({ ...prevState, cheatMode: "inactive" }));
    }
  }, [gameState.cheatMode]);

  // Render method of the ElasGame component
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
              checked={gameState.mode === "expert"}
              onChange={toggleMode}
              name="mode"
              color="primary"
              disabled={gameState.selectedPapers.ids.length > 0}
            />
          }
          label="Expert Mode"
        />

        <Typography variant="h6">
          {gameState.mode === "simple"
            ? `Simple Mode: ${gameState.gameStats.simple.matches} correct out of ${gameState.gameStats.simple.attempts} attempts`
            : `Expert Mode: ${gameState.gameStats.expert.matches} correct out of ${gameState.gameStats.expert.attempts} attempts`}
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

      {gameState.isExpertCompleted && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "primary.light",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <img
            src={ElasBalloons}
            alt="Celebration Balloons"
            style={{
              width: "100%",
              maxWidth: "50vw",
              margin: "0 auto",
              display: "block",
            }}
            onClick={handleCompletionDismiss}
          />
          <Typography variant="h4" color="primary" gutterBottom>
            Congratulations! You've completed the Expert Mode!
          </Typography>
        </Box>
      )}

      <Grid container justifyContent="center" spacing={2}>
        {gameState.imagesArray?.map((image, index) => (
          <Grid key={index} item>
            <Paper
              onClick={() => flipImage(image, index)}
              className={classes.paper}
              component={Stack}
              direction="column"
              justifyContent="center"
            >
              {gameState.cheatMode === "active" ||
              isCardChosen(image, index) ? (
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
