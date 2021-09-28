import React from "react";
import { Box, Link, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasFinished from "../../images/ElasFinished.svg";

const PREFIX = "ReviewPageFinished";

const classes = {
  root: `${PREFIX}-root`,
  img: `${PREFIX}-img`,
  textTitle: `${PREFIX}-textTitle`,
  text: `${PREFIX}-text`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },

  [`& .${classes.img}`]: {
    maxWidth: 350,
    [theme.breakpoints.down("md")]: {
      maxWidth: 250,
    },
  },

  [`& .${classes.textTitle}`]: {
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
  },

  [`& .${classes.text}`]: {
    textAlign: "center",
    width: "40%",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
  },
}));

const ReviewPageFinished = (props) => {
  return (
    <StyledBox className={classes.root} aria-label="project review finished">
      <img src={ElasFinished} alt="ElasFinished" className={classes.img} />
      <Typography className={classes.textTitle} variant="h5">
        Congratulations! You have finished this project.
      </Typography>
      <Typography className={classes.text}>
        You have stopped reviewing and marked this project as finished. If you
        want to resume the review, please <Link>update project status</Link>.
      </Typography>
    </StyledBox>
  );
};

export default ReviewPageFinished;
