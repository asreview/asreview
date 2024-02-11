import * as React from "react";
import ReactLoading from "react-loading";

import { Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography";

let width = window.screen.width;

const YouTubeVideoID = "k-a2SCq-LtA";

const PREFIX = "FinishSetup";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  [`& .${classes.root}`]: {
    alignItems: "center",
  },

  // [`& .${classes.formWarmup}`]: {
  //   alignItems: "flex-start",
  //   display: "flex",
  //   justifyContent: "center",
  //   height: "100%",
  // },
}));

const FinishSetup = ({ project_id, handleBack }) => {
  const theme = useTheme();

  return (
    <Root>
      <Stack spacing={3}>
        {/* {isTrainError && (
          <InlineErrorHandler
            message={trainError?.message}
            refetch={reset}
            button={true}
          />
        )} */}
        {/* {!isFetchingStatus && isStatusError && (
          <Stack className={classes.root} spacing={3}>
            <InlineErrorHandler message={statusError?.message} />
            <Button
            // onClick={}

            >Return to previous step</Button>
          </Stack>
        )} */}
        {/* {isError && (
          <InlineErrorHandler
            message={error?.message}
            // refetch={}
            button={true}
          />
        )} */}
      </Stack>
      <Stack spacing={3} className={classes.root}>
        {/* {!isTrainError && !isStatusError && (
          <YouTube
            videoId={YouTubeVideoID}
            opts={{
              height: "315",
              width: width < 560 ? width - 48 : "560",
              playerVars: {
                rel: 0,
              },
            }}
          />
        )} */}
        {/* {!isTrainError && !isStatusError && training && ( */}
        <Stack className={classes.root} spacing={1}>
          <Stack className={classes.root}>
            <TypographySubtitle1Medium>
              Warming up the AI
            </TypographySubtitle1Medium>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                width: width < 560 ? "90%" : "65%",
              }}
            >
              ASReview LAB is extracting features from the text and training the
              classifier with selected prior knowledge. Learn more by watching
              the video.
            </Typography>
          </Stack>
          <ReactLoading
            type="bubbles"
            color={theme.palette.primary.main}
            height={60}
            width={60}
          />
        </Stack>
        {/* )} */}
        {/* {!training && (
          <Stack spacing={3}>
            {info?.mode !== projectModes.SIMULATION && (
              <Stack className={classes.root} spacing={3}>
                <TypographySubtitle1Medium>
                  AI is ready to assist you
                </TypographySubtitle1Medium>
              </Stack>
            )}
            {info?.mode === projectModes.SIMULATION && (
              <Stack className={classes.root} spacing={3}>
                <Stack>
                  <TypographySubtitle1Medium>
                    Your simulation project has been initiated
                  </TypographySubtitle1Medium>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    It will take some time to complete the simulation
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        )} */}
      </Stack>
    </Root>
  );
};

export default FinishSetup;
