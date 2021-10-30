import React from "react";
import { InView } from "react-intersection-observer";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

import { LabeledRecordCard } from "../HistoryComponents";
import ErrorHandler from "../../ErrorHandler";

const PREFIX = "LabeledRecord";

const classes = {
  circularProgress: `${PREFIX}-circularProgress`,
  recordCard: `${PREFIX}-recordCard`,
  loadMoreInView: `${PREFIX}-loadMoreInView`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.circularProgress}`]: {
    display: "flex",
    justifyContent: "center",
    marginTop: "5%",
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
  return (
    <Root aria-label="labeled record container">
      {props.query.isError && <ErrorHandler error={props.query.error} />}
      {props.query.isLoading && (
        <Box className={classes.circularProgress}>
          <CircularProgress />
        </Box>
      )}
      {!props.query.isError && !props.query.isLoading && (
        <Box className={classes.recordCard} aria-label="labeled record card">
          {props.query.isFetched &&
            props.query.data.pages.map((page, index) => (
              <LabeledRecordCard
                page={page}
                mutateClassification={props.mutateClassification}
                key={`result-page-${index}`}
              />
            ))}
          <InView
            as="div"
            onChange={(inView, entry) => {
              if (
                inView &&
                props.query.hasNextPage &&
                !props.query.isFetchingNextPage
              ) {
                props.query.fetchNextPage();
              }
            }}
            className={classes.loadMoreInView}
          >
            <ButtonBase
              disabled={
                !props.query.hasNextPage || props.query.isFetchingNextPage
              }
            >
              <Typography gutterBottom variant="button">
                {props.query.isFetchingNextPage
                  ? "Loading more..."
                  : props.query.hasNextPage
                  ? "Load More"
                  : "Nothing more to load"}
              </Typography>
            </ButtonBase>
          </InView>
        </Box>
      )}
    </Root>
  );
};

export default LabeledRecord;
