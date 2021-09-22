import React from "react";
import { InView } from "react-intersection-observer";
import { ButtonBase, Container, Typography } from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import { makeStyles } from "@material-ui/core/styles";

import { LabeledRecordCard } from "../InReviewComponents";
import ErrorHandler from "../ErrorHandler";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
  },
  container: {
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
    <div>
      {props.query.isError && <ErrorHandler error={props.query.error} />}
      {!props.query.isError && (
        <Container className={classes.container}>
          {props.query.isFetched &&
            props.query.data.pages.map((page, index) => (
              <LabeledRecordCard
                page={page}
                toggleRecord={props.toggleRecord}
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
        </Container>
      )}
    </div>
  );
};

export default LabeledRecord;
