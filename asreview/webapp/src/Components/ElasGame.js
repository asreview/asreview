import React, { useEffect, useState, useCallback } from "react";
import {
  IconButton,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Refresh } from "@mui/icons-material";

// Importing image
import ElasBalloons from "images/ElasBalloons.svg";
import ElasPotter from "images/ElasPotter.svg";
import ElasArrowRightAhead from "images/ElasArrowRightAhead.svg";
import ElasConstructionWorkerOrange from "images/ElasConstructionWorkerOrange.svg";
import ElasArrowLeft from "images/ElasArrowLeft.svg";
import ElasGrad from "images/ElasGrad.svg";
import ElasWithDuck from "images/ElasWithDuck.svg";
import ElasFireMan from "images/ElasFireMan.svg";
import ElasPad from "images/ElasPad.svg";
import ElasFinished from "images/ElasFinished.svg";
import ElasRelevanceRanking from "images/ElasRelevanceRanking.svg";
import ElasConstructionWorkerYellow from "images/ElasConstructionWorkerYellow.svg";
import SantaElas from "images/SantaElas.svg";
import ElasPlayingRugby from "images/ElasPlayingRugby.svg";
import ElasPlayingTennis from "images/ElasPlayingTennis.svg";
import ElasasSuperHero from "images/ElasSuperHero.svg";
import ElasLion from "images/ElasLion.svg";
import ElasLollypop from "images/ElasLollypop.svg";
import ElasUnicorn from "images/ElasUnicorn.svg";
import ElasWinter from "images/ElasWinter.svg";
import ElasAvatar from "images/ElasAvatar.svg";

import ElasIcon from "icons/ElasIcon";

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
    expert: false,
    cheatMode: false,
    imagesArraySimple: initialShuffle("simple"),
    imagesArrayExpert: initialShuffle("expert"),
    imagesArray: initialShuffle("simple"),
    isExpertCompleted: false,
    gameStats: {
      simple: { openCards: [], attempts: 0, matches: 0 },
      expert: { openCards: [], attempts: 0, matches: 0 },
    },
    selectedPapers: { images: [], ids: [] },
  };

  const [gameState, setGameState] = useState(initialState);

  // Resets the game to initial state
  const resetGame = () => {
    setGameState((prevState) => {
      // Determine the current mode
      const currentMode = prevState.expert ? "expert" : "simple";

      // Reset stats for the current mode
      const resetStats = { openCards: [], attempts: 0, matches: 0 };
      const updatedGameStats = {
        ...prevState.gameStats,
        [currentMode]: resetStats,
      };

      // Shuffle images for the current mode
      const shuffledImages = initialShuffle(currentMode);

      return {
        ...prevState,
        gameStats: updatedGameStats,
        selectedPapers: { images: [], ids: [] },
        imagesArray: shuffledImages,
      };
    });
  };

  // Toggles between simple and expert modes
  const toggleMode = () => {
    setGameState((prevState) => ({
      ...prevState,
      expert: !prevState.expert,
      imagesArray: !prevState.expert
        ? prevState.imagesArrayExpert
        : prevState.imagesArraySimple,
    }));
  };

  const handleCompletionDismiss = useCallback(() => {
    setGameState((prevState) => ({ ...prevState, isExpertCompleted: false }));
  }, []);

  // Function to handle the flip action of a card
  function flipImage(image, index) {
    const currentMode = gameState.expert ? "expert" : "simple";
    if (
      gameState.cheatMode === "active" ||
      gameState.selectedPapers.ids.length >= 2
    )
      return;

    const { openCards, attempts, matches } = gameState.gameStats[currentMode];

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
          [currentMode]: {
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
    const currentMode = gameState.expert ? "expert" : "simple";
    const { openCards } = gameState.gameStats[currentMode];
    const isSelectedNow = gameState.selectedPapers.ids.includes(index);
    return openCards.includes(image) || isSelectedNow;
  }

  // useEffect hooks
  useEffect(() => {
    // Check if the expert mode is completed
    if (
      gameState.expert &&
      gameState.gameStats.expert.openCards.length ===
        gameState.imagesArray.length
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
    gameState.expert,
    gameState.gameStats.expert,
    gameState.imagesArray.length,
  ]);

  // Function to handle key press events
  const handleKeyPress = useCallback((event) => {
    if (event.key === "c") {
      setGameState((prevState) => ({ ...prevState, cheatMode: "active" }));
    }
  }, []);

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
              checked={gameState.expert}
              onChange={toggleMode}
              name="mode"
              color="primary"
              disabled={gameState.selectedPapers.ids.length > 0}
            />
          }
          label="Expert"
        />

        <Typography variant="h6">
          {gameState.expert
            ? `${gameState.gameStats.expert.matches} correct out of ${gameState.gameStats.expert.attempts} attempts`
            : `${gameState.gameStats.simple.matches} correct out of ${gameState.gameStats.simple.attempts} attempts`}
        </Typography>

        <IconButton onClick={resetGame}>
          <Refresh />
        </IconButton>
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
          <Grid key={index}>
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
