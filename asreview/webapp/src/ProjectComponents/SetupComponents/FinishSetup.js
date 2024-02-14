import * as React from "react";
import ReactLoading from "react-loading";
import { useMutation, useQuery } from "react-query";
import { ProjectAPI } from "../../api";
import { queryClient, useQueryClient } from "react-query";

import {
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography";
import { useToggle } from "../../hooks/useToggle";

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
  [`& .${classes.formWarmup}`]: {
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "center",
    height: "100%",
  },
}));

const FinishSetup = ({ project_id, refetch }) => {
  const theme = useTheme();

  const [openSkipTraining, toggleSkipTraining] = useToggle();

  // mutate and start new training
  const { mutate: startTraining, isLoading: isTraining } = useMutation(
    ProjectAPI.mutateTraining,
    {
      onSuccess: () => {
        refetch();
      },
    },
  );

  const skipTraining = (method) => {
    if (method === "random") {
      startTraining({ project_id: project_id, ranking: "random" });
    } else if (method === "top-down") {
      startTraining({ project_id: project_id, ranking: "top-down" });
    }
  };

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

        {/* Button to skip this and start reviewing */}
        <Button onClick={toggleSkipTraining} disabled={isTraining}>
          I can't wait
        </Button>
      </Stack>
      <Dialog
        open={openSkipTraining}
        onClose={toggleSkipTraining}
        aria-labelledby="skip-training-dialog"
      >
        <DialogTitle id="skip-training-dialog">
          Review already? Let's get started!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to review already? Your model will be trained in the
            background. Once the model is finished training, you see better
            results. Choose one of the following options to start reviewing:
          </DialogContentText>
          <Button onClick={() => skipTraining("random")} disabled={isTraining}>
            Random
          </Button>
          <Button
            onClick={() => skipTraining("top-down")}
            disabled={isTraining}
          >
            Top down
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleSkipTraining}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default FinishSetup;
