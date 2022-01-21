import * as React from "react";
import { connect } from "react-redux";
import { useMutation, useQueryClient } from "react-query";
import TruncateMarkup from "react-truncate-markup";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  Favorite,
  FavoriteBorder,
  KeyboardArrowUp,
  NoteAddOutlined,
} from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";
import { RecordCardNote } from "../HistoryComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";
import "../../App.css";

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
    justifyContent: "space-between",
  },
}));

const LabeledRecordCard = (props) => {
  const queryClient = useQueryClient();
  const [recordReadMore, setRecordReadMore] = React.useState(null);
  const [note, setNote] = React.useState({
    data: null,
    editing: null,
  });

  const { error, isError, isLoading, mutate, reset } = useMutation(
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
                        value.id !== variables.doc_id
                          ? value.included
                          : variables.label,
                      note:
                        value.id !== variables.doc_id
                          ? value.note
                          : !variables.note
                          ? null
                          : variables.note,
                    };
                  }),
                };
              }),
            };
          }
        );
        if (variables.doc_id === recordReadMore) {
          setRecordReadMore(null);
        }
        if (variables.doc_id === note.editing) {
          setNote({
            data: null,
            editing: null,
          });
        }
        if (props.is_prior) {
          queryClient.invalidateQueries("fetchLabeledStats");
        }
      },
    }
  );

  const handleClickLabelConvert = (value) => {
    mutate({
      project_id: props.project_id,
      doc_id: value.id,
      label: value.included === 1 ? 0 : 1,
      note: !value.note ? "" : value.note,
      initial: false,
      is_prior: !props.is_prior ? 0 : 1,
    });
  };

  const handleClickAddNote = (doc_id) => {
    setNote((s) => {
      return {
        ...s,
        editing: doc_id,
      };
    });
  };

  const handleClickRemoveNote = (value) => {
    if (!value.note) {
      setNote({
        data: null,
        editing: null,
      });
    } else {
      mutate({
        project_id: props.project_id,
        doc_id: value.id,
        label: value.included,
        note: "",
        initial: false,
        is_prior: 0,
      });
    }
  };

  const disableAddNoteButton = (doc_id) => {
    return doc_id !== note.editing && note.editing !== null;
  };

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
                {value.title ? value.title : "No title available"}
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
                  {value.abstract ? value.abstract : "No abstract available"}
                </Typography>
              </TruncateMarkup>
            </CardContent>
            <CardActions className={classes.cardActions}>
              <Tooltip
                title={
                  note.editing !== value.id
                    ? value.included === 1
                      ? "Convert to irrelevant"
                      : "Convert to relevant"
                    : "Save note before converting"
                }
              >
                <span>
                  <IconButton
                    disabled={isLoading || note.editing === value.id}
                    onClick={() => {
                      handleClickLabelConvert(value);
                    }}
                  >
                    {value.included === 1 ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              {!props.is_prior && !value.note && value.id !== note.editing && (
                <Tooltip
                  title={
                    !disableAddNoteButton(value.id)
                      ? "Add note"
                      : "Save another note before adding"
                  }
                >
                  <span>
                    <IconButton
                      disabled={disableAddNoteButton(value.id)}
                      onClick={() => handleClickAddNote(value.id)}
                    >
                      <NoteAddOutlined />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {!props.is_prior && value.id === note.editing && (
                <Tooltip title="Remove note">
                  <span>
                    <IconButton
                      disabled={isLoading}
                      onClick={() => handleClickRemoveNote(value)}
                    >
                      <KeyboardArrowUp />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </CardActions>
            <RecordCardNote
              isLoading={isLoading}
              record={value}
              mutate={mutate}
              note={note}
              setNote={setNote}
              is_prior={props.is_prior}
            />
          </Card>
        ))}
    </Root>
  );
};

export default connect(mapStateToProps)(LabeledRecordCard);
