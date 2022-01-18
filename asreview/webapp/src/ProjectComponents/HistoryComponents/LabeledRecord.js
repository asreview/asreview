import React from "react";
import clsx from "clsx";
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
  priorRecordCard: `${PREFIX}-prior-record-card`,
  loadMoreInView: `${PREFIX}-loadMoreInView`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.loading}`]: {
    display: "flex",
    justifyContent: "center",
    padding: 64,
  },

  [`& .${classes.priorRecordCard}`]: {
    height: "calc(100vh - 208px)",
    overflowY: "scroll",
    padding: "16px 24px",
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
      enabled:
        props.label === "relevant" &&
        (!props.is_prior ? true : !props.n_prior_inclusions ? false : true),
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
      enabled:
        props.label === "irrelevant" &&
        (!props.is_prior ? true : !props.n_prior_exclusions ? false : true),
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  const filteredQuery = () => {
    if (props.label === "relevant") {
      return [relevantQuery, "fetchRelevantLabeledRecord"];
    }
    if (props.label === "irrelevant") {
      return [irrelevantQuery, "fetchIrrelevantLabeledRecord"];
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
      {filteredQuery()[0].isError && (
        <BoxErrorHandler
          error={filteredQuery()[0].error}
          queryKey={filteredQuery()[1]}
        />
      )}
      {props.n_prior !== 0 &&
        !filteredQuery()[0].isError &&
        (filteredQuery()[0].isLoading || !mounted.current) && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}
      {props.n_prior !== 0 &&
        !filteredQuery()[0].isError &&
        !(filteredQuery()[0].isLoading || !mounted.current) &&
        filteredQuery()[0].isFetched && (
          <Fade
            in={
              !filteredQuery()[0].isError &&
              !(filteredQuery()[0].isLoading || !mounted.current) &&
              filteredQuery()[0].isFetched
            }
          >
            <Box
              className={clsx({
                [classes.priorRecordCard]: props.is_prior,
              })}
              aria-label="labeled record card"
            >
              {filteredQuery()[0].isFetched &&
                filteredQuery()[0].data.pages.map((page, index) => (
                  <LabeledRecordCard
                    page={page}
                    label={props.label}
                    key={`result-page-${index}`}
                    is_prior={props.is_prior}
                  />
                ))}
              <InView
                as="div"
                onChange={(inView, entry) => {
                  if (
                    inView &&
                    filteredQuery()[0].hasNextPage &&
                    !filteredQuery()[0].isFetchingNextPage
                  ) {
                    filteredQuery()[0].fetchNextPage();
                  }
                }}
                className={classes.loadMoreInView}
              >
                <ButtonBase
                  disabled={
                    !filteredQuery()[0].hasNextPage ||
                    filteredQuery()[0].isFetchingNextPage
                  }
                >
                  <Typography gutterBottom variant="button">
                    {filteredQuery()[0].isFetchingNextPage
                      ? "Loading more..."
                      : filteredQuery()[0].hasNextPage
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
