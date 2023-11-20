import React from "react";
import { connect } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import TruncateMarkup from "react-truncate-markup";
import {
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

import { InlineErrorHandler } from "../../../Components";
import { ExplorationModeRecordAlert } from "../../../StyledComponents/StyledAlert.js";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps, projectModes } from "../../../globals.js";

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
                project_id: props.project_id,
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
                      record.id === variables.doc_id
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
                project_id: props.project_id,
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
                      record.id === variables.doc_id
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
      return props.record._debug_label === 1;
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
          {props.record._debug_label !== null && (
            <ExplorationModeRecordAlert
              label={!isDebugInclusion() ? "irrelevant" : "relevant"}
            />
          )}
          <CardContent className="record-card-content">
            <Typography gutterBottom variant="h6">
              {props.record.title ? props.record.title : "No title available"}
            </Typography>
            <TruncateMarkup
              lines={props.record.id === recordReadMore ? Infinity : 6}
              ellipsis={
                <span>
                  ...{" "}
                  <Link
                    component="button"
                    underline="none"
                    onClick={() => setRecordReadMore(props.record.id)}
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
          <CardActions sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Is this record relevant?
            </Typography>
            <Box>
              <Button
                id="relevant"
                onClick={() => {
                  mutate({
                    project_id: props.project_id,
                    doc_id: props.record.id,
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
                    project_id: props.project_id,
                    doc_id: props.record.id,
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

export default connect(mapStateToProps)(PriorUnlabeled);
