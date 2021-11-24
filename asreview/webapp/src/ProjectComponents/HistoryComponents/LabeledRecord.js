import React from "react";
import { connect } from "react-redux";
import { InView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import {
  Box,
  ButtonBase,
  CircularProgress,
  Fade,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

import { BoxErrorHandler } from "../../Components";
import { LabeledRecordCard } from "../HistoryComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const PREFIX = "LabeledRecord";

const classes = {
  loading: `${PREFIX}-loading`,
  recordCard: `${PREFIX}-recordCard`,
  loadMoreInView: `${PREFIX}-loadMoreInView`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
    padding: 64,
  },

  [`& .${classes.recordCard}`]: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 168px)",
    width: "100%",
    overflowY: "scroll",
    padding: "16px 0px",
  },

  [`& .${classes.loadMoreInView}`]: {
    color: grey[500],
    display: "flex",
    justifyContent: "center",
  },
}));

const LabeledRecord = (props) => {
  const relevantQuery = useInfiniteQuery(
    [
      "fetchRelevantLabeledRecord",
      {
        project_id: props.project_id,
        select: "included",
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: props.label === "relevant",
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  const irrelevantQuery = useInfiniteQuery(
    [
      "fetchIrrelevantLabeledRecord",
      {
        project_id: props.project_id,
        select: "excluded",
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: props.label === "irrelevant",
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  const filteredQuery = () => {
    if (props.label === "relevant") {
      return relevantQuery;
    }
    if (props.label === "irrelevant") {
      return irrelevantQuery;
    }
  };

  const filteredQueryKey = () => {
    if (props.label === "relevant") {
      return "fetchRelevantLabeledRecord";
    }
    if (props.label === "irrelevant") {
      return "fetchIrrelevantLabeledRecord";
    }
  };

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
    <Root aria-label="labeled record container">
      {filteredQuery().isError && (
        <BoxErrorHandler
          error={filteredQuery().error}
          queryKey={filteredQueryKey()}
        />
      )}
      {!filteredQuery().isError &&
        (filteredQuery().isLoading || !mounted.current) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
      {!filteredQuery().isError &&
        !(filteredQuery().isLoading || !mounted.current) && (
          <Fade
            in={
              !filteredQuery().isError &&
              !(filteredQuery().isLoading || !mounted.current)
            }
          >
            <Box
              className={classes.recordCard}
              aria-label="labeled record card"
            >
              {filteredQuery().isFetched &&
                filteredQuery().data.pages.map((page, index) => (
                  <LabeledRecordCard
                    page={page}
                    label={props.label}
                    key={`result-page-${index}`}
                  />
                ))}
              <InView
                as="div"
                onChange={(inView, entry) => {
                  if (
                    inView &&
                    filteredQuery().hasNextPage &&
                    !filteredQuery().isFetchingNextPage
                  ) {
                    filteredQuery().fetchNextPage();
                  }
                }}
                className={classes.loadMoreInView}
              >
                <ButtonBase
                  disabled={
                    !filteredQuery().hasNextPage ||
                    filteredQuery().isFetchingNextPage
                  }
                >
                  <Typography gutterBottom variant="button">
                    {filteredQuery().isFetchingNextPage
                      ? "Loading more..."
                      : filteredQuery().hasNextPage
                      ? "Load More"
                      : "Nothing more to load"}
                  </Typography>
                </ButtonBase>
              </InView>
            </Box>
          </Fade>
        )}
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecord);
