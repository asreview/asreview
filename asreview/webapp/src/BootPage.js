import * as React from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Fade, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { BaseAPI } from "./api/index.js";
import { useToggle } from "./hooks/useToggle";
import { CoronaIcon, ElasIcon, PlusIcon } from "./icons";
import { setASReviewVersion } from "./redux/actions";

import "./BootPage.css";

const PREFIX = "BootPage";

const classes = {
  background: `${PREFIX}-background`,
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  color: `${PREFIX}-color`,
  error: `${PREFIX}-error`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.background}`]: {
    backgroundColor: theme.palette.primary.main,
    height: "100%",
    width: "100%",
    position: "absolute",
  },

  [`& .${classes.root}`]: {
    height: "inherit",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.content}`]: {
    justifyContent: "center",
  },

  [`& .${classes.color}`]: {
    color: "#FFF",
  },

  [`& .${classes.error}`]: {
    textAlign: "center",
    marginTop: theme.spacing(3),
    backgroundColor: "#FFF",
  },
}));

const mapDispatchToProps = (dispatch) => {
  return {
    setASReviewVersion: (asreview_version) => {
      dispatch(setASReviewVersion(asreview_version));
    },
  };
};

const BootPage = ({ setASReviewVersion }) => {
  const navigate = useNavigate();
  const [onAnimation, toggleAnimation] = useToggle(false);

  const setVersion = React.useCallback(
    (v) => {
      setASReviewVersion(v);
    },
    [setASReviewVersion]
  );

  const { data, error, isError, isFetching } = useQuery("boot", BaseAPI.boot, {
    onSuccess: (data) => {
      // set the version of asreview
      setVersion(data.version);

      // skip the loader when you are in development mode
      if (data["status"] === "development") {
        navigate("projects");
      } else {
        toggleAnimation();
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isFetching) {
    return null;
  }

  if (!isFetching && isError) {
    return (
      <Root>
        <Box className={classes.background}>
          <Typography className={classes.error} color="error" variant="h4">
            {error.message !== null
              ? error.message
              : "Network Error - Failed to connect to server."}
          </Typography>
        </Box>
      </Root>
    );
  }

  /* no errors, continue with bootloading */
  if (!isFetching && !isError) {
    return (
      <Root>
        <Fade
          in={onAnimation}
          timeout={{ enter: 0, exit: 600 }}
          mountOnEnter
          unmountOnExit
          onEnter={() => {
            setTimeout(() => {
              toggleAnimation();
            }, 3000);
          }}
          onExited={() => {
            navigate("projects");
          }}
        >
          <Box className={classes.background}>
            <Stack className={classes.root} spacing={6}>
              <Stack className={classes.content} direction="row">
                <ElasIcon htmlColor="white" sx={{ fontSize: 160 }} />
                {data.status === "asreview-covid19" && (
                  <Box>
                    <PlusIcon
                      htmlColor="white"
                      sx={{ fontSize: 60, mt: "50px", mb: "50px" }}
                    />
                    <CoronaIcon
                      className="rotate"
                      htmlColor="white"
                      sx={{ fontSize: 160 }}
                    />
                  </Box>
                )}
              </Stack>
              <Stack className={classes.content} direction="row" spacing={3}>
                <Typography className={classes.color} variant="h3">
                  ASReview LAB
                </Typography>
                {data.status === "asreview-covid19" && (
                  <Stack direction="row" spacing={3}>
                    <Typography
                      className={classes.color}
                      variant="h5"
                      sx={{ alignSelf: "center" }}
                    >
                      against
                    </Typography>
                    <Typography className={classes.color} variant="h3">
                      COVID-19
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>
        </Fade>
      </Root>
    );
  }
};

export default connect(null, mapDispatchToProps)(BootPage);
