import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Fade, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasPotter from "./images/ElasPotter.png";

const PREFIX = "RouteNotFound";

const classes = {
  img: `${PREFIX}-img`,
  textTitle: `${PREFIX}-textTitle`,
};

const Root = styled("div")(({ theme }) => ({
  height: "inherit",
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
}));

const RouteNotFound = (props) => {
  const navigate = useNavigate();

  const handleClickHomePage = () => {
    navigate("/");
  };

  return (
    <Root aria-label="route not found">
      <Fade in>
        <Stack
          spacing={3}
          sx={{
            alignItems: "center",
            height: "inherit",
            justifyContent: "center",
          }}
        >
          <img src={ElasPotter} alt="ElasPotter" className={classes.img} />
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            <Typography className={classes.textTitle} variant="h5">
              Whoops! You have come to an unexplored land.
            </Typography>
            <Button onClick={handleClickHomePage}>Go home</Button>
          </Stack>
        </Stack>
      </Fade>
    </Root>
  );
};

export default RouteNotFound;
