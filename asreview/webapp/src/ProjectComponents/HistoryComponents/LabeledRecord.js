import React from "react";
import { InView } from "react-intersection-observer";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import makeStyles from "@mui/styles/makeStyles";

import { LabeledRecordCard } from "../HistoryComponents";
import ErrorHandler from "../../ErrorHandler";

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  circularProgress: {
    display: "flex",
    justifyContent: "center",
    marginTop: "5%",
  },
  recordCard: {
    width: "100%",
    maxWidth: 960,
    "& > *": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  loadMoreInView: {
    color: grey[500],
    display: "flex",
    justifyContent: "center",
  },
}));

const LabeledRecord = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} aria-label="labeled record container">
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
    </Box>
  );
};

export default LabeledRecord;
