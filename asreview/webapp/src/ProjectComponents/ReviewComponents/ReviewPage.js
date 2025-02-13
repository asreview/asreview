import { useMediaQuery } from "@mui/material";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { Container } from "@mui/material";
import { RecordCard, ReviewPageFinished } from ".";

import { ProjectAPI } from "api";

import FinishSetup from "./ReviewPageTraining";

import { useReviewSettings } from "context/ReviewSettingsContext";
import StoppingReachedDialog from "./StoppingReachedDialog";
import { projectStatuses } from "globals.js";

const ReviewPage = () => {
  let { project_id } = useParams();
  const queryClient = useQueryClient();

  const { fontSize, modelLogLevel, orientation } = useReviewSettings();

  const [tagValues, setTagValues] = React.useState({});

  const { refetch, data, isSuccess } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchInterval: (data) =>
        data?.result && !data?.pool_empty ? -1 : 4000,
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
    refetchInterval: (data) =>
      statusData?.status === projectStatuses.FINISHED ? -1 : 4000,
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
          {data?.result !== null && (
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
              afterDecision={() => {
                queryClient.invalidateQueries("fetchRecord");
                queryClient.invalidateQueries("fetchStopping");
              }}
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

          {data?.result === null && !data?.pool_empty && (
            <FinishSetup project_id={project_id} refetch={refetch} />
          )}

          {data?.result === null && data?.pool_empty && <ReviewPageFinished />}

          <StoppingReachedDialog
            open={showStoppingDialog}
            onClose={handleCloseDialog}
            project_id={project_id}
          />
        </>
      )}
    </Container>
  );
};

export default ReviewPage;
