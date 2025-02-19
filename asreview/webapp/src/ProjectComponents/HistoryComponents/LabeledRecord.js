import { Box, ButtonBase, Fade, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";
import { InView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

import { InlineErrorHandler } from "Components";
import { RecordCard } from "ProjectComponents/ReviewComponents";
import { ProjectAPI } from "api";

import { useMediaQuery } from "@mui/material";
import { useReviewSettings } from "context/ReviewSettingsContext";

const LabeledRecord = ({ project_id, label, filterQuery, mode = "oracle" }) => {
  const { orientation, modelLogLevel } = useReviewSettings();

  let landscapeDisabled = useMediaQuery(
    (theme) => theme.breakpoints.down("md"),
    {
      noSsr: true,
    },
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    [
      "fetchLabeledRecord",
      {
        project_id: project_id,
        subset: label,
        filter: filterQuery.map((filter) => filter.value),
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
    },
  );

  /**
   * Check if this component is mounted
   */
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Box aria-label="labeled record">
      {isError && <InlineErrorHandler message={error?.message} />}
      {/* {n_prior !== 0 && !isError && (isLoading || !mounted.current) && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )} */}
      {!isError && !(isLoading || !mounted.current) && isFetched && (
        <Fade in={!isError && !(isLoading || !mounted.current) && isFetched}>
          <Stack aria-label="labeled record card" spacing={5}>
            {isFetched &&
              data?.pages.map((page) =>
                page.result.map((record) => (
                  <RecordCard
                    project_id={project_id}
                    record={record}
                    collapseAbstract={true}
                    disabled={true}
                    transitionType="collapse"
                    transitionSpeed={{ enter: 500, exit: 800 }}
                    landscape={
                      orientation === "landscape" && !landscapeDisabled
                    }
                    modelLogLevel={modelLogLevel}
                    changeDecision={mode === "oracle"}
                    key={
                      "record-card-" +
                      project_id +
                      "-" +
                      record?.record_id +
                      "-" +
                      record?.state?.note +
                      "-" +
                      JSON.stringify(record?.tags_form)
                    }
                  />
                )),
              )}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <InView
                as="div"
                onChange={(inView, entry) => {
                  if (inView && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
              >
                <ButtonBase disabled={!hasNextPage || isFetchingNextPage}>
                  <Typography
                    gutterBottom
                    variant="button"
                    sx={{ color: grey[500] }}
                  >
                    {isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                        ? "Load More"
                        : "Nothing more to load"}
                  </Typography>
                </ButtonBase>
              </InView>
            </Box>
          </Stack>
        </Fade>
      )}
    </Box>
  );
};

export default LabeledRecord;
