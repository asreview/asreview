import React, { useCallback, useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import clsx from "clsx";
import {
  Box,
  Chip,
  CircularProgress,
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
import { LabeledRecord } from "../InReviewComponents";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps } from "../globals.js";

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
  rootHidden: {
    padding: 0,
    visibility: "hidden",
    position: "fixed",
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

  /**
   * 2nd layer record state
   */
  const [record, setRecord] = useState({
    data: null,
    converting: false,
    converted: 0,
  });

  const allQuery = useInfiniteQuery(
    [
      "fetchAllLabeledRecord",
      {
        project_id: props.project_id,
      },
    ],
    ProjectAPI.fetchLabeledRecord,
    {
      enabled: props.onReviewHistory,
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

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
      enabled: props.onReviewHistory,
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
      enabled: props.onReviewHistory,
      getNextPageParam: (lastPage) => lastPage.next_page ?? false,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onMutate: () => {
      // set converting state if 2nd layer record state is on
      if (record.data !== null) {
        setRecord((prev) => {
          return {
            ...prev,
            converting: true,
          };
        });
      }
    },
    onSuccess: (data, variables) => {
      // update cached data
      queryClient.setQueryData(
        [
          select === DEFAULT_SELECTION
            ? "fetchAllLabeledRecord"
            : select === 2
            ? "fetchRelevantLabeledRecord"
            : "fetchIrrelevantLabeledRecord",
          {
            project_id: props.project_id,
            select:
              select === DEFAULT_SELECTION
                ? undefined
                : select === 2
                ? "included"
                : "excluded",
          },
        ],
        (prev) => {
          return {
            ...prev,
            pages: prev.pages.map((page) => {
              return {
                ...page,
                result: page.result.map((value) => {
                  return {
                    ...value,
                    included:
                      value.id === variables.doc_id
                        ? value.included === 1
                          ? 0
                          : 1
                        : value.included,
                  };
                }),
              };
            }),
          };
        }
      );
      // set converting state if 2nd layer record state is on
      if (record.data !== null) {
        setTimeout(
          () => {
            setRecord((prev) => {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  included: prev.data.included === 1 ? 0 : 1,
                },
                converting: false,
                converted: prev.data ? prev.converted + 1 : 0,
              };
            });
          },
          record.data && record.converted % 2 === 0 ? 1500 : 0
        );
      }
    },
  });

  const handleSelectChange = (event) => {
    setSelect(event.target.value);
  };

  // second layer record toggle
  const toggleRecord = useCallback(
    (event, value) => {
      event.preventDefault();
      if (record.data === null) {
        setRecord((s) => {
          return {
            ...s,
            data: value,
          };
        });
      } else {
        setRecord({
          data: null,
          converting: false,
          converted: 0,
        });
      }
    },
    [record.data]
  );

  /**
   * Remove cached queries when close history dialog
   */
  const closeReviewHistory = () => {
    queryClient.removeQueries("fetchAllLabeledRecord");
    queryClient.removeQueries("fetchRelevantLabeledRecord");
    queryClient.removeQueries("fetchIrrelevantLabeledRecord");
    props.toggleReviewHistory();
  };

  /**
   * Reset selection and clear 2nd layer cache when exit history dialog
   */
  const exitedReviewHistory = () => {
    setSelect(DEFAULT_SELECTION);
    setRecord({
      data: null,
      converting: false,
      converted: 0,
    });
  };

  /**
   * 2nd layer convert chip label & color
   */
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
        record.data.included === 0
          ? "Converted to irrelevant"
          : "Converted to relevant";
      convertColor = record.data.included === 0 ? "default" : "secondary";
    }
  }

  useEffect(() => {
    if (props.onReviewHistory) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onReviewHistory]);

  return (
    <Box>
      <Dialog
        fullScreen={fullScreen}
        open={props.onReviewHistory}
        onClose={closeReviewHistory}
        scroll="paper"
        fullWidth={true}
        maxWidth={"md"}
        PaperProps={{
          style: { height: "inherit" },
        }}
        TransitionProps={{
          onExited: exitedReviewHistory,
        }}
      >
        {record.data === null && (
          <AppBarWithinDialog
            onClickStartIcon={closeReviewHistory}
            selectedValue={select}
            onChangeSelect={handleSelectChange}
            selectOptions={selectOptions}
          />
        )}

        {record.data !== null && (
          <AppBarWithinDialog
            startIconIsClose={false}
            onClickStartIcon={toggleRecord}
          />
        )}

        {(select === DEFAULT_SELECTION
          ? allQuery
          : select === 2
          ? relevantQuery
          : irrelevantQuery
        ).isLoading && (
          <DialogContent className={classes.root}>
            <Box className={classes.circularProgress}>
              <CircularProgress />
            </Box>
          </DialogContent>
        )}

        {record.data === null && (
          <DialogContent
            className={clsx(classes.root, {
              [classes.rootHidden]: select !== 1 || allQuery.isLoading,
            })}
          >
            <LabeledRecord
              query={allQuery}
              toggleRecord={toggleRecord}
              mutateClassification={mutate}
            />
          </DialogContent>
        )}

        {record.data === null && (
          <DialogContent
            className={clsx(classes.root, {
              [classes.rootHidden]: select !== 2 || relevantQuery.isLoading,
            })}
          >
            <LabeledRecord
              query={relevantQuery}
              toggleRecord={toggleRecord}
              mutateClassification={mutate}
            />
          </DialogContent>
        )}

        {record.data === null && (
          <DialogContent
            className={clsx(classes.root, {
              [classes.rootHidden]: select !== 3 || irrelevantQuery.isLoading,
            })}
          >
            <LabeledRecord
              query={irrelevantQuery}
              toggleRecord={toggleRecord}
              mutateClassification={mutate}
            />
          </DialogContent>
        )}

        {/* Record details */}
        {record.data !== null && (
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

        {record.data !== null && (
          <DialogActions className={classes.action}>
            <Box className={classes.chip}>
              <Chip
                disabled={record.converting}
                color={convertColor}
                icon={
                  record.converting && record.converted % 2 === 0 ? (
                    <CircularProgress size="1rem" thickness={5} />
                  ) : record.data.included === 1 ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )
                }
                label={convertLabel}
                onClick={() => {
                  mutate({
                    project_id: props.project_id,
                    doc_id: record.data.id,
                    label: record.data.included,
                    initial: false,
                  });
                }}
                variant="outlined"
              />
            </Box>
          </DialogActions>
        )}

        {/* Error handler to be added */}
      </Dialog>
    </Box>
  );
};

export default connect(mapStateToProps)(ReviewHistoryDialog);
