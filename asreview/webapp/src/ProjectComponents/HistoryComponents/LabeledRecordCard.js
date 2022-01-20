import React from "react";
import { connect } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import TruncateMarkup from "react-truncate-markup";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { Comment, Favorite, FavoriteBorder } from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";
import "../../App.css";

import ElasAvatar from "../../images/ElasAvatar.svg";

const PREFIX = "LabeledRecordCard";

const classes = {
  root: `${PREFIX}-root`,
  cardActions: `${PREFIX}-card-actions`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    borderRadius: 16,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    maxWidth: 960,
  },

  [`& .${classes.cardActions}`]: {
    justifyContent: "flex-end",
  },
}));

const LabeledRecordCard = (props) => {
  const queryClient = useQueryClient();
  const [recordReadMore, setRecordReadMore] = React.useState(null);
  const [showNote, setShowNote] = React.useState(null);

  const { error, isError, mutate, reset } = useMutation(
    ProjectAPI.mutateClassification,
    {
      mutationKey: "mutateLabeledPriorKnowledge",
      onSuccess: (data, variables) => {
        // update cached data
        queryClient.setQueryData(
          [
            "fetchLabeledRecord",
            {
              project_id: props.project_id,
              subset: props.returnSubset(),
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
        if (props.is_prior) {
          queryClient.invalidateQueries("fetchLabeledStats");
        }
      },
    }
  );

  return (
    <Root>
      {isError && (
        <Box sx={{ pt: 8, pb: 16 }}>
          <InlineErrorHandler
            message={error["message"]}
            refetch={reset}
            button={true}
          />
        </Box>
      )}
      {!isError &&
        props.page.result.map((value) => (
          <Card elevation={3} className={classes.root} key={value.id}>
            <CardContent className="record-card-content">
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
            <CardActions className={classes.cardActions}>
              {!props.is_prior && (
                <Tooltip
                  title={
                    value.id !== showNote
                      ? !value.note
                        ? "Add note"
                        : "Show note"
                      : "Hide note"
                  }
                >
                  <IconButton
                    onClick={() => {
                      value.id !== showNote
                        ? setShowNote(value.id)
                        : setShowNote(null);
                    }}
                    size="large"
                  >
                    <Comment fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip
                title={
                  value.included === 1
                    ? "Convert to irrelevant"
                    : "Convert to relevant"
                }
              >
                <IconButton
                  onClick={() => {
                    mutate({
                      project_id: props.project_id,
                      doc_id: value.id,
                      label: value.included === 1 ? 0 : 1,
                      note: !value.note ? "" : value.note,
                      initial: false,
                      is_prior: !props.is_prior ? 0 : 1,
                    });
                  }}
                  size="large"
                >
                  {value.included === 1 ? (
                    <Favorite color="error" fontSize="small" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </CardActions>
            <Collapse in={value.id === showNote} timeout="auto" unmountOnExit>
              <Divider />
              <CardContent className="record-card-content">
                <Stack direction="row" spacing={3}>
                  <Avatar
                    alt="user"
                    src={ElasAvatar}
                    size={50}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "grey.600" : "grey.400",
                    }}
                    imgProps={{ sx: { p: 1 } }}
                  />
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      width: "100%",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "background.paper"
                          : "grey.100",
                    }}
                  >
                    <CardContent>
                      <Typography sx={{ color: "text.secondary" }}>
                        {value.note}
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        ))}
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecordCard);
