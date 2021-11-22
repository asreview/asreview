import React from "react";
import { connect } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import TruncateMarkup from "react-truncate-markup";
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

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
      // update cached data
      queryClient.setQueryData(
        [
          props.label === "relevant"
            ? "fetchRelevantLabeledRecord"
            : "fetchIrrelevantLabeledRecord",
          {
            project_id: props.project_id,
            select: props.label === "relevant" ? "included" : "excluded",
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
    },
  });

  return (
    <Root>
      {props.page.result.map((value) => (
        <Card elevation={3} className={classes.root} key={value.id}>
          <CardContent>
            <Typography gutterBottom variant="h6">
              {value.title ? value.title : "No title available."}
            </Typography>
            <TruncateMarkup
              lines={value.id === recordReadMore ? Infinity : 6}
              ellipsis={
                <span>
                  ...{" "}
                  <Link
                    component="button"
                    underline="none"
                    onClick={() => setRecordReadMore(value.id)}
                  >
                    read more
                  </Link>
                </span>
              }
            >
              <Typography color="textSecondary">
                {value.abstract ? value.abstract : "No abstract available."}
              </Typography>
            </TruncateMarkup>
          </CardContent>
          <CardActions>
            <Tooltip
              title={
                value.included === 1
                  ? "Convert to irrelevant"
                  : "Convert to relevant"
              }
            >
              <IconButton
                className={classes.icon}
                onClick={() => {
                  mutate({
                    project_id: props.project_id,
                    doc_id: value.id,
                    label: value.included,
                    initial: false,
                  });
                }}
                size="large"
              >
                {value.included === 1 ? (
                  <FavoriteIcon color="error" fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      ))}
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecordCard);
