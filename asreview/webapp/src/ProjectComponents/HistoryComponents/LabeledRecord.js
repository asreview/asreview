import { ButtonBase, Fade, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import React from "react";
import { InView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";

import { BoxErrorHandler } from "Components";
import { RecordCard } from "ProjectComponents/ReviewComponents";
import { ProjectAPI } from "api";

const PREFIX = "LabeledRecord";

const classes = {
  loadMoreInView: `${PREFIX}-loadMoreInView`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loadMoreInView}`]: {
    color: grey[500],
    display: "flex",
    justifyContent: "center",
  },
}));

const LabeledRecord = (props) => {
  const enableQuery = () => {
    return !props.is_prior
      ? true
      : !(
          (props.label === "relevant" && !props.n_prior_inclusions) ||
          (props.label === "irrelevant" && !props.n_prior_exclusions) ||
          (props.label === "all" && !props.n_prior)
        );
  };

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
        project_id: props.project_id,
        subset: props.label,
        filter: props.filterQuery.map((filter) => filter.value),
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: enableQuery(),
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
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
    <Root aria-label="labeled record">
      {isError && (
        <BoxErrorHandler error={error} queryKey="fetchLabeledRecord" />
      )}
      {/* {props.n_prior !== 0 && !isError && (isLoading || !mounted.current) && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )} */}
      {enableQuery() &&
        !isError &&
        !(isLoading || !mounted.current) &&
        isFetched && (
          <Fade in={!isError && !(isLoading || !mounted.current) && isFetched}>
            <Stack aria-label="labeled record card" spacing={3}>
              {isFetched &&
                data?.pages.map((page) =>
                  page.result.map((record) => (
                    <RecordCard
                      project_id={props.project_id}
                      record={record}
                      collapseAbstract={true}
                      disabled={true}
                      transitionType="none"
                      key={record.record_id}
                    />
                  )),
                )}
              <InView
                as="div"
                onChange={(inView, entry) => {
                  if (inView && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                className={classes.loadMoreInView}
              >
                <ButtonBase disabled={!hasNextPage || isFetchingNextPage}>
                  <Typography gutterBottom variant="button">
                    {isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                        ? "Load More"
                        : "Nothing more to load"}
                  </Typography>
                </ButtonBase>
              </InView>
            </Stack>
          </Fade>
        )}
    </Root>
  );
};

export default LabeledRecord;
