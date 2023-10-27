import { useEffect, useState } from "react";

import { Grid, Paper, Stack, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasBalloons from "../images/ElasBalloons.svg";
import ElasPotter from "../images/ElasPotter.svg";
import ElasArrowRightAhead from "../images/ElasArrowRightAhead.svg";
import ElasConstructionWorkerOrange from "../images/ElasConstructionWorkerOrange.svg";
import ElasArrowLeft from "../images/ElasArrowLeft.svg";
import ElasGrad from "../images/ElasGrad.svg";
import ElasWithDuck from "../images/ElasWithDuck.svg";
import ElasFireMan from "../images/ElasFireMan.svg";
import ElasWelcome from "../images/ElasWelcome.svg";
import ElasFinished from "../images/ElasFinished.svg";
import BenefitFromAI from "../images/FinishSetup_2_BenefitFromAI.svg";
import ElasPublished from "../images/FinishSetup_5_OpenScience.svg";
import ElasRelevanceRanking from "../images/ElasRelevanceRanking.svg";
import ElasConstructionWorkerYellow from "../images/ElasConstructionWorkerYellow.svg";
import ElasPlayingRugby from "../images/ElasPlayingRugby.svg";
import ElasPlayingTennis from "../images/ElasPlayingTennis.svg";
import ElasFlyingTurtle from "../images/ElasFlyingTurtle.svg";
import ElasFlyingTurtle from "../images/ElasFlyingTurtle.svg";
import ElasasSuperHero from "../icons/ElasasSuperHero";

const images = [
  ElasConstructionWorkerOrange,
  ElasFireMan,
  ElasWithDuck,
  ElasBalloons,
  ElasGrad,
  ElasArrowRightAhead,
  ElasPotter,
  ElasArrowLeft,
  ElasWelcome,
  ElasFinished,
  BenefitFromAI,
  ElasPublished,
  ElasRelevanceRanking,
  ElasConstructionWorkerYellow,
  ElasPlayingRugby,
  ElasPlayingTennis,
  ElasFlyingTurtle,
  ElasasSuperHero
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
  const [imagesArray, setImagesArray] = useState([]);
  const [paperSelected, setPaperSelected] = useState([]);
  const [paperSelectedIds, setPaperSelectedIds] = useState([]);

  const [openCards, setOpenCards] = useState([]);

  // function createElasGrid() {
  //   const imagesGenerated = images?.concat(...images);
  //   const shuffledImages = shuffle(imagesGenerated);
  //   setImagesArray(shuffledImages);
  // }

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
    const imagesGenerated = images?.concat(...images);
    const shuffledImages = shuffle(imagesGenerated);
    setImagesArray(shuffledImages);
  }, []);

  return (
    <GameStyle>
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
              {isCardChosen(image, index) ? (
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
