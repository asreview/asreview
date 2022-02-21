import React from "react";
import clsx from "clsx";
import { connect } from "react-redux";
import { InView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import { useParams } from "react-router-dom";
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
  const { project_id } = useParams();

  const [subset, setSubset] = React.useState(null);

  const returnSubset = () => {
    return !subset ? [props.label] : [props.label].concat(subset);
  };

  const enableQuery = () => {
    return !props.is_prior
      ? true
      : !(
          (props.label === "relevant" && !props.n_prior_inclusions) ||
          (props.label === "irrelevant" && !props.n_prior_exclusions)
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
        project_id: !project_id ? props.project_id : project_id,
        subset: returnSubset(),
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: enableQuery(),
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  React.useEffect(() => {
    setSubset(
      props.filterQuery?.map((element) => {
        return element.value;
      })
    );
  }, [props.filterQuery]);

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
      {props.n_prior !== 0 && !isError && (isLoading || !mounted.current) && (
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      )}
      {enableQuery() &&
        !isError &&
        !(isLoading || !mounted.current) &&
        isFetched && (
          <Fade in={!isError && !(isLoading || !mounted.current) && isFetched}>
            <Box
              className={clsx({
                [classes.priorRecordCard]: props.is_prior,
              })}
              aria-label="labeled record card"
            >
              {isFetched &&
                data.pages.map((page, index) => (
                  <LabeledRecordCard
                    page={page}
                    label={props.label}
                    key={`result-page-${index}`}
                    is_prior={props.is_prior}
                    returnSubset={returnSubset}
                    mobileScreen={props.mobileScreen}
                  />
                ))}
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
            </Box>
          </Fade>
        )}
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecord);
