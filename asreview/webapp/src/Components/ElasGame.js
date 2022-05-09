import { useEffect, useState } from "react";

import { Grid, Paper, Stack, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasBalloons from "../images/ElasBalloons.png";
import ElasPotter from "../images/ElasPotter.png";
import ElasArrowRightAhead from "../images/ElasArrowRightAhead.png";
import ElasConstructionWorkerOrange from "../images/ElasConstructionWorkerOrange.svg";
import ElasArrowLeft from "../images/ElasArrowLeft.png";
import ElasGrad from "../images/ElasGrad.png";
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
        paperSelectedIds?.concat(index)
      );

      if (paperSelected?.length === 1) {
        if (paperSelected[0] === image) {
          setOpenCards((openCards) =>
            openCards?.concat([paperSelected[0], image])
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
