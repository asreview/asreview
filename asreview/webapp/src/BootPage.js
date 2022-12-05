import * as React from "react";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "./Components";

import { useToggle } from "./hooks/useToggle";

import ASReviewLAB_black from "./images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "./images/asreview_sub_logo_lab_white_transparent.svg";

import "./BootPage.css";

const PREFIX = "BootPage";

const classes = {
  background: `${PREFIX}-background`,
  root: `${PREFIX}-root`,
  logo: `${PREFIX}-logo`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.background}`]: {
    backgroundColor: theme.palette.background.paper,
    height: "100%",
    width: "100%",
    position: "absolute",
  },

  [`& .${classes.root}`]: {
    height: "inherit",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.logo}`]: {
    width: 600,
  },
}));


const BootPage = (props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [onAnimation, toggleAnimation] = useToggle(true);

  // THIS NEEDS ATTENTION
  const error = { message: "This is a message" };
  const isError = false;

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  return (
    <Root>
      <Box className={classes.background}>
          <Stack className={classes.root} spacing={3}>
          <img
              className={classes.logo}
              src={wordmarkState()}
              alt="ASReview LAB"
          />
          {!isError && (
              <ReactLoading
              type="bubbles"
              color={
                  theme.palette.mode === "dark"
                  ? theme.palette.primary.main
                  : theme.palette.primary.light
              }
              height={100}
              width={100}
              />
          )}
          {isError && <InlineErrorHandler message={error.message} />}
          </Stack>
      </Box>
    </Root>
  );
};

// export default connect(null, mapDispatchToProps)(BootPage);
export default BootPage;
