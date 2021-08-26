import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";

import { AppBarWithinDialog } from "../Components";
import { LabeledRecordCard } from "../InReviewComponents";
import ErrorHandler from "../ErrorHandler";

import { ProjectAPI } from "../api/index.js";

import { mapStateToProps } from "../globals.js";

import { connect } from "react-redux";

const DEFAULT_SELECTION = 1;

const selectOptions = [
  {
    value: 1,
    label: "All",
  },
  {
    value: 2,
    label: "Relevant",
  },
  {
    value: 3,
    label: "Irrelevant",
  },
];

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
  record: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  action: {
    padding: "32px 24px 24px 24px",
    justifyContent: "flex-start",
  },
  chip: {
    marginLeft: "auto",
  },
  circularProgress: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const ReviewHistoryDialog = (props) => {
  const queryClient = useQueryClient();
  const classes = useStyles();

  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [select, setSelect] = useState(DEFAULT_SELECTION);

  // second layer record state
  const [record, setRecord] = useState({
    index: null,
    data: null,

    converting: false,
    converted: 0,
  });

  const { data, error, isFetched, isLoading } = useQuery(
    ["fetchLabeledRecord", { project_id: props.project_id }],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: props.onReviewHistory && !record.converting,
      refetchOnWindowFocus: false,
      select: (data) =>
        data.filter((record) =>
          select === DEFAULT_SELECTION
            ? record
            : select === 2
            ? record.included === 1
            : record.included === 0
        ),
    }
  );

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onMutate: () => {
      setRecord((s) => {
        return {
          ...s,
          converting: true,
        };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("fetchLabeledRecord");
      setTimeout(
        () => {
          setRecord((s) => {
            return {
              ...s,
              converting: false,
              converted: record.data ? record.converted + 1 : 0,
            };
          });
        },
        record.data && record.converted % 2 === 0 ? 1500 : 0
      );
    },
  });

  const handleSelectChange = (event) => {
    setSelect(event.target.value);
  };

  // second layer record toggle
  const toggleRecord = (event, index) => {
    event.preventDefault();
    if (record.index === null) {
      setRecord((s) => {
        return {
          ...s,
          index: index,
          data: data[index],
        };
      });
    } else {
      setRecord({
        index: null,
        data: null,
        converting: false,
        converted: 0,
      });
    }
  };

  const exitReviewHistory = () => {
    setRecord({
      index: null,
      data: null,
      converting: false,
      converted: 0,
    });
  };

  useEffect(() => {
    if (props.onReviewHistory) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onReviewHistory]);

  let convertLabel = record.data
    ? record.data.included === 1
      ? "Convert to irrelevant"
      : "Convert to relevant"
    : "";

  let convertColor = record.data
    ? record.data.included === 1
      ? "secondary"
      : "default"
    : "";

  if (record.converting && record.data) {
    if (record.converted % 2 === 0) {
      convertLabel =
        record.data.included === 1
          ? "Converting to irrelevant"
          : "Converting to relevant";
      convertColor = record.data.included === 1 ? "secondary" : "default";
    }
  } else {
    if (record.converted && record.converted % 2 !== 0) {
      convertLabel =
        data[0].included === 0
          ? "Converted to irrelevant"
          : "Converted to relevant";
      convertColor = data[0].included === 0 ? "default" : "secondary";
    }
  }

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.onReviewHistory}
        onClose={props.toggleReviewHistory}
        onExited={exitReviewHistory}
        scroll="paper"
        fullWidth={true}
        maxWidth={"md"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        PaperProps={{
          style: { height: "inherit" },
        }}
      >
        {record.index === null && (
          <AppBarWithinDialog
            onClickStartIcon={props.toggleReviewHistory}
            selectedValue={select}
            onChangeSelect={handleSelectChange}
            selectOptions={selectOptions}
          />
        )}

        {record.index !== null && (
          <AppBarWithinDialog
            startIconIsClose={false}
            onClickStartIcon={toggleRecord}
          />
        )}

        {error !== null && (
          <DialogContent className={classes.root}>
            <ErrorHandler error={error} />
          </DialogContent>
        )}

        {error === null && record.index === null && (
          <DialogContent className={classes.root}>
            {isLoading && (
              <div className={classes.circularProgress}>
                <CircularProgress />
              </div>
            )}
            {isFetched && (
              <Container className={classes.container}>
                {data.map((value, index) => {
                  return (
                    <LabeledRecordCard
                      value={value}
                      index={index}
                      handleClick={toggleRecord}
                      mutate={mutate}
                      key={`result-item-${value.id}`}
                    />
                  );
                })}
              </Container>
            )}
          </DialogContent>
        )}

        {/* Record details */}
        {error === null && record.index !== null && (
          <DialogContent className={classes.record}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {record.data.title}
              </Typography>

              {(record.data.abstract === "" ||
                record.data.abstract === null) && (
                <Box fontStyle="italic">
                  <Typography gutterBottom>
                    This record doesn't have an abstract.
                  </Typography>
                </Box>
              )}

              {!(
                record.data.abstract === "" || record.data.abstract === null
              ) && <Typography>{record.data.abstract}</Typography>}
            </Box>
          </DialogContent>
        )}

        {error === null && record.index !== null && (
          <DialogActions className={classes.action}>
            <div className={classes.chip}>
              <Chip
                disabled={record.converting}
                color={convertColor}
                icon={
                  record.converting && record.converted % 2 === 0 ? (
                    <CircularProgress size="1rem" thickness={5} />
                  ) : data[record.converted ? 0 : record.index].included ===
                    1 ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )
                }
                label={convertLabel}
                onClick={() => {
                  mutate({
                    project_id: props.project_id,
                    doc_id: data[record.converted ? 0 : record.index].id,
                    label: data[record.converted ? 0 : record.index].included,
                    initial: false,
                  });
                }}
                variant="outlined"
              />
            </div>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default connect(mapStateToProps)(ReviewHistoryDialog);
