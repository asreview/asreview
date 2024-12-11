import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";

import ElasArrowRightAhead from "images/ElasArrowRightAhead.svg";
import ElasBalloons from "images/ElasBalloons.svg";
import ElasConstructionWorkerOrange from "images/ElasConstructionWorkerOrange.svg";
import ElasConstructionWorkerYellow from "images/ElasConstructionWorkerYellow.svg";
import ElasFireMan from "images/ElasFireMan.svg";
import ElasGrad from "images/ElasGrad.svg";
import ElasLollypop from "images/ElasLollypop.svg";
import ElasPad from "images/ElasPad.svg";
import ElasPlayingRugby from "images/ElasPlayingRugby.svg";
import ElasPlayingTennis from "images/ElasPlayingTennis.svg";
import ElasPotter from "images/ElasPotter.svg";
import ElasRelevanceRanking from "images/ElasRelevanceRanking.svg";
import ElasasSuperHero from "images/ElasSuperHero.svg";
import ElasUnicorn from "images/ElasUnicorn.svg";
import ElasWinter from "images/ElasWinter.svg";
import ElasWithDuck from "images/ElasWithDuck.svg";
import SantaElas from "images/SantaElas.svg";

import ElasIcon from "icons/ElasIcon";

import { useToggle } from "hooks/useToggle";
import { useHotkeys } from "react-hotkeys-hook";

const images = [
  ElasConstructionWorkerOrange,
  ElasFireMan,
  ElasWithDuck,
  ElasGrad,
  ElasArrowRightAhead,
  ElasPotter,
  ElasPad,
  ElasRelevanceRanking,
  ElasConstructionWorkerYellow,
  ElasPlayingRugby,
  ElasPlayingTennis,
  ElasasSuperHero,
  SantaElas,
  ElasLollypop,
  ElasUnicorn,
  ElasWinter,
];

function getShuffleCards() {
  const shuffled = Array.from({ length: 32 }, (_, i) => Math.floor(i / 2));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const GameCard = ({ cardIndex, cardValue, open, clickCard, disabled }) => {
  return (
    <Paper
      onClick={() => {
        !open && !disabled && clickCard(cardIndex);
      }}
      sx={(theme) => ({
        bgcolor:
          theme.palette.mode === "dark" ? "primary.dark" : "primary.light",
        height: 120,
        padding: 1,
      })}
      elevation={6}
    >
      {open && (
        <Box
          component="img"
          src={images[cardValue]}
          alt=""
          sx={{
            objectFit: "scale-down",
            height: 1,
            width: 1,
          }}
        />
      )}

      {!open && (
        <ElasIcon
          sx={{
            fontSize: 100,
            color: "white",
            opacity: 0.6,
            width: 1,
          }}
        />
      )}
    </Paper>
  );
};

const ElasGame = ({ toggleOpen }) => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), {
    noSsr: true,
  });

  const [state, setState] = useState({
    images: getShuffleCards(),
    found: [],
    selected: [],
    count: 0,
  });

  const clickCard = (cardIndex) => {
    if (
      state.selected.length === 1 &&
      state.images[state.selected[0]] === state.images[cardIndex]
    ) {
      setState({
        ...state,
        found: state.found.concat(state.images[cardIndex]),
        selected: [],
        count: state.count + 1,
      });
    } else if (state.selected.length === 1) {
      setState({
        ...state,
        selected: state.selected.concat(cardIndex),
        count: state.count + 1,
      });
    } else {
      setState({ ...state, selected: state.selected.concat(cardIndex) });
    }
  };

  // cheat
  const [cheat, toggleCheat] = useToggle();
  useHotkeys("SHIFT+c", !cheat ? toggleCheat : () => {}, { keydown: true });
  useHotkeys("SHIFT+c", toggleCheat, { keyup: true });

  // close the cards after 1 second if not matched
  useEffect(() => {
    if (state.selected.length === 2) {
      setTimeout(() => setState({ ...state, selected: [] }), 1000);
    }
  }, [state]);

  return (
    <>
      <DialogTitle id="game-dialog-title">
        {`Adventures of Elas${!mobileScreen ? ` Memory Game` : ``}: ${state.count} attempts`}
      </DialogTitle>
      <DialogContent>
        {state.found.length === state.images.length / 2 && (
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
              onClick={() => {}}
            />
            <Typography variant="h4" gutterBottom>
              Well done!
            </Typography>
          </Box>
        )}

        <Grid
          container
          spacing={2}
          columns={8}
          // sx={(theme) => ({
          //   [theme.breakpoints.up("md")]: {
          //     maxWidth: 600,
          //   },
          // })}
        >
          {state.images?.map((v, index) => (
            <Grid
              key={index}
              size={{ xs: 2, sm: 2, md: 1, lg: 1, xl: 1 }}
              justifyContent="center"
              alignItems="center"
            >
              <GameCard
                cardIndex={index}
                cardValue={v}
                open={
                  cheat ||
                  state.found.includes(v) ||
                  state.selected.includes(index)
                }
                disabled={state.selected.length === 2}
                clickCard={clickCard}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            setState({
              images: getShuffleCards(),
              found: [],
              selected: [],
              count: 0,
            })
          }
        >
          Reset
        </Button>
        <Button onClick={toggleOpen}>Take me back</Button>
      </DialogActions>
    </>
  );
};

const ElasGameDialog = ({ open, toggleOpen }) => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), {
    noSsr: true,
  });

  return (
    <Dialog
      open={open}
      onClose={toggleOpen}
      scroll={"paper"}
      fullWidth={true}
      maxWidth={"md"}
      fullScreen={mobileScreen}
      aria-labelledby="game-dialog-title"
      aria-describedby="game-dialog-description"
    >
      <ElasGame toggleOpen={toggleOpen} />
    </Dialog>
  );
};

export default ElasGameDialog;
