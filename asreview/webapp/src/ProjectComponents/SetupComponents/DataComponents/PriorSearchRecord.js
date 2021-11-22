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

import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps } from "../../../globals.js";

const PREFIX = "LabeledRecordCard";

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    borderRadius: 16,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxWidth: 960,
  },

  [`& .${classes.icon}`]: {
    marginLeft: "auto",
  },
}));

const LabeledRecordCard = (props) => {
  const queryClient = useQueryClient();
  const [recordReadMore, setRecordReadMore] = React.useState(null);

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onSuccess: (data, variables) => {
      if (!variables.label) {
        if (!props.n_prior) {
          queryClient.fetchQuery(
            [
              "fetchIrrelevantLabeledRecord",
              {
                project_id: props.project_id,
                select: "excluded",
              },
            ],
            ProjectAPI.fetchLabeledRecord
          );
        } else {
          queryClient.invalidateQueries("fetchIrrelevantLabeledRecord");
        }
      } else {
        if (!props.n_prior) {
          queryClient.fetchQuery(
            [
              "fetchRelevantLabeledRecord",
              {
                project_id: props.project_id,
                select: "included",
              },
            ],
            ProjectAPI.fetchLabeledRecord
          );
        } else {
          queryClient.invalidateQueries("fetchRelevantLabeledRecord");
        }
      }
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
        }
      );
    },
  });

  return (
    <Root>
      <Card elevation={3} className={classes.root}>
        <CardContent>
          <Typography gutterBottom variant="h6">
            {props.record.title ? props.record.title : "No title available."}
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
                : "No abstract available."}
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
              onClick={() => {
                mutate({
                  project_id: props.project_id,
                  doc_id: props.record.id,
                  label: 1,
                  initial: true,
                  is_prior: 1,
                });
              }}
              size="small"
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                mutate({
                  project_id: props.project_id,
                  doc_id: props.record.id,
                  label: 0,
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
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecordCard);
