import React from "react";
import { useMutation, useQueryClient } from "react-query";
import TruncateMarkup from "react-truncate-markup";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  RecordCard,
  ReviewPageFinished,
} from "ProjectComponents/ReviewComponents";

import { InlineErrorHandler } from "Components";
import { ExplorationModeRecordAlert } from "StyledComponents/StyledAlert";
import { ProjectAPI } from "api";
import { projectModes } from "globals.js";

import { ProjectContext } from "ProjectContext";
import { useContext } from "react";

const PREFIX = "PriorUnlabeled";

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
};

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  [`& .${classes.root}`]: {
    borderRadius: 16,
  },

  [`& .${classes.icon}`]: {
    marginLeft: "auto",
  },
}));

const PriorUnlabeled = (props) => {
  const project_id = useContext(ProjectContext);

  const queryClient = useQueryClient();
  const [recordReadMore, setRecordReadMore] = React.useState(null);

  const { error, isError, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      mutationKey: "mutatePriorKnowledge",
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries("fetchLabeledStats");
        queryClient.invalidateQueries([
          "fetchLabeledRecord",
          { subset: ["all"] },
        ]);
        if (!variables.label) {
          queryClient.invalidateQueries([
            "fetchLabeledRecord",
            { subset: ["irrelevant"] },
          ]);
        } else {
          queryClient.invalidateQueries([
            "fetchLabeledRecord",
            { subset: ["relevant"] },
          ]);
        }
        if (props.keyword) {
          // update cached data
          queryClient.setQueryData(
            [
              "fetchPriorSearch",
              {
                project_id: project_id,
                keyword: props.keyword,
              },
            ],
            (prev) => {
              return {
                ...prev,
                result: prev.result.map((record) => {
                  return {
                    ...record,
                    included:
                      record.record_id === variables.record_id
                        ? variables.label
                        : record.included,
                  };
                }),
              };
            },
          );
        } else {
          // update cached data
          queryClient.setQueryData(
            [
              "fetchPriorRandom",
              {
                project_id: project_id,
                n: props.nRecords,
                subset:
                  props.mode !== projectModes.ORACLE ? props.subset : null,
              },
            ],
            (prev) => {
              return {
                ...prev,
                result: prev.result.map((record) => {
                  return {
                    ...record,
                    included:
                      record.record_id === variables.record_id
                        ? variables.label
                        : record.included,
                  };
                }),
              };
            },
          );
        }
      },
    },
  );

  const isDebugInclusion = () => {
    if (props.record) {
      return props.record.label_from_dataset === 1;
    }
  };

  return (
    <Root className="search-result">
      {isError && (
        <Box sx={{ pt: 8 }}>
          <InlineErrorHandler
            message={error["message"]}
            refetch={reset}
            button={true}
          />
        </Box>
      )}
      {!isError && (
        <Card elevation={3} className={classes.root}>
          {/* {props.mode !== projectModes.ORACLE && props.record.label_from_dataset !== null && (
            <ExplorationModeRecordAlert
              label={
                props.record.label_from_dataset === -1
                  ? "not seen"
                  : !isDebugInclusion()
                    ? "irrelevant"
                    : "relevant"
              }
              prior={true}
            />
          )} */}
          <CardContent className="record-card-content">
            <Typography gutterBottom variant="h6">
              {props.record.title ? props.record.title : "No title available"}
            </Typography>
            <TruncateMarkup
              lines={props.record.record_id === recordReadMore ? Infinity : 6}
              ellipsis={
                <span>
                  ...{" "}
                  <Link
                    component="button"
                    underline="none"
                    onClick={() => setRecordReadMore(props.record.record_id)}
                  >
                    read more
                  </Link>
                </span>
              }
            >
              <Typography sx={{ color: "text.secondary" }}>
                {props.record.abstract
                  ? props.record.abstract
                  : "No abstract available"}
              </Typography>
            </TruncateMarkup>
          </CardContent>
          <Divider />

          <Alert severity="info" sx={{ margin: "0.5rem 1rem" }}>
            {props.record.label_from_dataset === -1
              ? "No label in dataset"
              : !isDebugInclusion()
                ? "Label in dataset is irrelevant"
                : "Label in dataset is relevant"}
          </Alert>

          <CardActions sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Is this record relevant?
            </Typography>
            <Box>
              <Button
                id="relevant"
                onClick={() => {
                  mutate({
                    project_id: project_id,
                    record_id: props.record.record_id,
                    label: 1,
                    note: "",
                    initial: true,
                    is_prior: 1,
                  });
                }}
                size="small"
              >
                Yes
              </Button>
              <Button
                id="irrelevant"
                onClick={() => {
                  mutate({
                    project_id: project_id,
                    record_id: props.record.record_id,
                    label: 0,
                    note: "",
                    initial: true,
                    is_prior: 1,
                  });
                }}
                size="small"
              >
                No
              </Button>
            </Box>
          </CardActions>
        </Card>
      )}
    </Root>
  );
};

export default PriorUnlabeled;
