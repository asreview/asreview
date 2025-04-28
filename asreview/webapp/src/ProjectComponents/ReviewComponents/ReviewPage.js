import { Button, Stack, Typography, useMediaQuery } from "@mui/material";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { Container } from "@mui/material";
import { RecordCard } from ".";

import { ProjectAPI } from "api";

import ElasFinished from "images/ElasFinished.svg";
import FinishSetup from "./ReviewPageTraining";

import { useReviewSettings } from "context/ReviewSettingsContext";
import StoppingReachedDialog from "./StoppingReachedDialog";
import { projectStatuses } from "globals.js";
import { Alert } from "@mui/material";

const ReviewPage = () => {
  let { project_id } = useParams();
  const queryClient = useQueryClient();

  const { fontSize, modelLogLevel, orientation } = useReviewSettings();

  const [tagValues, setTagValues] = React.useState({});

  const { refetch, data, isSuccess, isError, error } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchInterval: (data, query) => {
        if (query.state.error || data?.status !== "setup") return false;
        return 4000;
      },
      refetchIntervalInBackground: true,
    },
  );

  const [showStoppingDialog, setShowStoppingDialog] = React.useState(false);
  const [dismissedThresholdValue, setDismissedThresholdValue] =
    React.useState(null);

  const { data: statusData } = useQuery(
    ["fetchProjectStatus", { project_id }],
    ProjectAPI.fetchProjectStatus,
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleCloseDialog = () => {
    setShowStoppingDialog(false);
    setDismissedThresholdValue(
      queryClient.getQueryData(["fetchStopping", { project_id }])?.params?.n,
    );
  };

  useQuery(["fetchStopping", { project_id }], ProjectAPI.fetchStopping, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      const hasThreshold = Boolean(data?.params?.n);
      if (
        hasThreshold &&
        data?.value >= data?.params?.n &&
        data?.params?.n !== dismissedThresholdValue &&
        statusData?.status !== projectStatuses.FINISHED &&
        (dismissedThresholdValue === null ||
          data?.params?.n > dismissedThresholdValue)
      ) {
        setShowStoppingDialog(true);
      }
    },
  });

  let showBorder = useMediaQuery((theme) => theme.breakpoints.up("md"), {
    noSsr: true,
  });

  let landscapeDisabled = useMediaQuery(
    (theme) => theme.breakpoints.down("md"),
    {
      noSsr: true,
    },
  );

  const afterDecision = () => {
    window.scrollTo({ top: 0 });
    queryClient.invalidateQueries({
      queryKey: ["fetchRecord", { project_id }],
    });
    queryClient.invalidateQueries({
      queryKey: ["fetchStopping", { project_id }],
    });
  };

  return (
    <Container
      aria-label="review page"
      maxWidth="md"
      sx={(theme) => ({
        mb: 6,
        [theme.breakpoints.down("md")]: {
          px: 0,
          mb: 0,
        },
      })}
    >
      {isSuccess && (
        <>
          {data?.status === "setup" && (
            <FinishSetup project_id={project_id} refetch={refetch} />
          )}

          {data?.status === "review" && data?.result !== null && (
            <RecordCard
              key={
                "record-card-" +
                project_id +
                "-" +
                data?.result?.record_id +
                "-" +
                JSON.stringify(data?.result?.tags_form)
              }
              project_id={project_id}
              record={data?.result}
              afterDecision={afterDecision}
              fontSize={fontSize}
              showBorder={showBorder}
              modelLogLevel={modelLogLevel}
              tagValues={tagValues}
              setTagValues={setTagValues}
              collapseAbstract={false}
              hotkeys={true}
              landscape={orientation === "landscape" && !landscapeDisabled}
            />
          )}
          {data?.status === "review" && data?.result === null && (
            <Stack spacing={3} sx={{ alignItems: "center" }}>
              <img
                src={ElasFinished}
                alt="Celebration for reviewing all records"
                width="400"
              />
              <Typography variant="h5">
                Wow! You have reviewed all the records.
              </Typography>
            </Stack>
          )}
          <StoppingReachedDialog
            open={showStoppingDialog}
            onClose={handleCloseDialog}
            project_id={project_id}
          />
          {data?.status === "finished" && (
            <Stack spacing={1} sx={{ alignItems: "center" }}>
              <img
                src={ElasFinished}
                alt="Celebration for finished project"
                width="400"
              />
              <Typography variant="h5">
                Congratulations! You have finished this project.
              </Typography>
              <Typography>
                You have stopped reviewing and marked this project as finished.
                You can change this on the project dashboard.
              </Typography>
            </Stack>
          )}
        </>
      )}

      {isError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            ASReview LAB failed to load a new record
          </Typography>
          {error?.message && (
            <Typography variant="body1" gutterBottom>
              {error.message}
            </Typography>
          )}
          <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
            Try to load again
          </Button>
        </Alert>
      )}
    </Container>
  );
};

export default ReviewPage;
