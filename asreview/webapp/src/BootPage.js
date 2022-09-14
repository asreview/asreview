import * as React from "react";
import ReactLoading from "react-loading";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Fade, Stack } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "./Components";

import { BaseAPI } from "./api/index.js";
import { useToggle } from "./hooks/useToggle";
import { setASReviewVersion, setAuthenticated } from "./redux/actions";

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

const mapDispatchToProps = (dispatch) => {
  console.log('Hello2');
  return {
    setASReviewVersion: (asreview_version) => {
      dispatch(setASReviewVersion(asreview_version));
    },
    setAuthenticated: (authenticated) => {
      dispatch(setAuthenticated(authenticated));
    },
  };
};

const BootPage = ({ setASReviewVersion }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [onAnimation, toggleAnimation] = useToggle(false);

  const setGlobals = React.useCallback(
    (data) => {
      setASReviewVersion(data.Version);
      setAuthenticated(data.authenticated);
    },
    [setASReviewVersion, setAuthenticated]
  );

  const { error, isError } = useQuery("boot", BaseAPI.boot, {
    onSettled: (data) => {
      // skip the loader when you are in development mode
      if (data?.status === "development") {
        if (data?.authenticated) {
          navigate("/signin");
        } else {
          navigate("/projects");
        }
      } else {
        toggleAnimation();
      }
    },
    onSuccess: (data) => {
      // set the version of asreview
      setGlobals(data);
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  return (
    <Root>
      <Fade
        in={onAnimation}
        timeout={{ enter: 0, exit: 600 }}
        mountOnEnter
        unmountOnExit
        onEnter={() => {
          if (!isError) {
            setTimeout(() => {
              toggleAnimation();
            }, 3000);
          }
        }}
        onExited={() => {
          navigate("/signin");
        }}
      >
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
      </Fade>
    </Root>
  );
};

export default connect(null, mapDispatchToProps)(BootPage);
