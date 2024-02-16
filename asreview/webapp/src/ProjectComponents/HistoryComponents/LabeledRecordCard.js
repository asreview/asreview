import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import TruncateMarkup from "react-truncate-markup";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  LabelOff,
  Link as LinkIcon,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";
import { RecordCardNote } from "../HistoryComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../api";
import { mapStateToProps, projectModes } from "../../globals";
import { DOIIcon } from "../../icons";

const PREFIX = "LabeledRecordCard";

const classes = {
  root: `${PREFIX}-root`,
  cardActions: `${PREFIX}-card-actions`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    borderRadius: 16,
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
                        value.record_id !== variables.record_id
                          ? value.included
                          : variables.label,
                      note:
                        value.record_id !== variables.record_id
                          ? value.note
                          : !variables.note
                            ? null
                            : variables.note,
                    };
                  }),
                };
              }),
            };
          },
        );
        if (variables.record_id === recordReadMore) {
          setRecordReadMore(null);
        }
        if (variables.record_id === note.editing) {
          setNote({
            data: null,
            editing: null,
          });
        }
        if (props.is_prior) {
          queryClient.invalidateQueries("fetchLabeledStats");
        }
      },
    },
  );

  const handleClickLabelConvert = (value) => {
    mutate({
      project_id: props.project_id,
      record_id: value.record_id,
      label: value.included === 1 ? 0 : 1,
      note: !value.note ? "" : value.note,
      initial: false,
      is_prior: !props.is_prior ? 0 : 1,
    });
  };

  const handleClickRemoveLabel = (value) => {
    mutate({
      project_id: props.project_id,
      record_id: value.record_id,
      label: -1,
      note: !value.note ? "" : value.note,
      initial: false,
      is_prior: 1,
    });
  };

  const handleClickAddNote = (record_id) => {
    setNote((s) => {
      return {
        ...s,
        editing: record_id,
      };
    });
  };

  const disableAddNoteButton = (record_id) => {
    return record_id !== note.editing && note.editing !== null;
  };

  // only on history page
  const disableConvertPrior = (prior) => {
    return !props.is_prior && prior === 1;
  };

  const isSimulationProject = () => {
    return props.mode === projectModes.SIMULATION;
  };

  return (
    <Root>
      <Stack spacing={3}>
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
          props.page.result
            .filter((value) => value.included !== -1)
            .map((value) => (
              <Card
                elevation={3}
                className={classes.root}
                key={value.record_id}
              >
                <CardContent className="record-card-content">
                  <Stack spacing={1}>
                    <Typography variant="h6">
                      {value.title ? value.title : "No title available"}
                    </Typography>
                    {!props.is_prior && (value.doi || value.url) && (
                      <Stack direction="row" spacing={1}>
                        {/* Show DOI if available */}
                        {value.doi && (
                          <StyledIconButton
                            className="record-card-icon"
                            href={"https://doi.org/" + value.doi}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DOIIcon />
                          </StyledIconButton>
                        )}

                        {/* Show URL if available */}
                        {value.url && (
                          <Tooltip title="Open URL">
                            <StyledIconButton
                              className="record-card-icon"
                              href={value.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LinkIcon />
                            </StyledIconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    )}
                    <TruncateMarkup
                      lines={value.record_id === recordReadMore ? Infinity : 6}
                      ellipsis={
                        <span>
                          ...{" "}
                          <Link
                            component="button"
                            underline="none"
                            onClick={() => setRecordReadMore(value.record_id)}
                          >
                            read more
                          </Link>
                        </span>
                      }
                    >
                      <Typography color="textSecondary">
                        {value.abstract
                          ? value.abstract
                          : "No abstract available"}
                      </Typography>
                    </TruncateMarkup>
                  </Stack>
                </CardContent>
                <CardActions className={classes.cardActions}>
                  <Tooltip
                    title={
                      !isSimulationProject()
                        ? disableConvertPrior(value.prior)
                          ? "Prior knowledge cannot be converted"
                          : note.editing !== value.record_id
                            ? value.included === 1
                              ? "Convert to irrelevant"
                              : "Convert to relevant"
                            : "Save note before converting"
                        : "Cannot be converted in simulation mode"
                    }
                  >
                    <span>
                      <IconButton
                        disabled={
                          isSimulationProject() ||
                          disableConvertPrior(value.prior) ||
                          isLoading ||
                          note.editing === value.record_id
                        }
                        onClick={() => {
                          handleClickLabelConvert(value);
                        }}
                      >
                        {value.included === 1 ? (
                          <Favorite
                            color="error"
                            fontSize={!props.mobileScreen ? "medium" : "small"}
                          />
                        ) : (
                          <FavoriteBorder
                            fontSize={!props.mobileScreen ? "medium" : "small"}
                          />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  {props.is_prior && (
                    <Tooltip
                      title={`Remove ${
                        value.included !== 1 ? "irrelevant" : "relevant"
                      } label`}
                    >
                      <span>
                        <IconButton
                          disabled={isLoading}
                          onClick={() => {
                            handleClickRemoveLabel(value);
                          }}
                        >
                          <LabelOff
                            fontSize={!props.mobileScreen ? "medium" : "small"}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {!props.is_prior &&
                    !value.note &&
                    value.record_id !== note.editing && (
                      <Tooltip
                        title={
                          !props.isSimulating
                            ? !disableAddNoteButton(value.record_id)
                              ? ""
                              : "Save another note before adding"
                            : "Add note after simulation is finished"
                        }
                      >
                        <span>
                          <Button
                            disabled={
                              props.isSimulating ||
                              disableAddNoteButton(value.record_id)
                            }
                            onClick={() => handleClickAddNote(value.record_id)}
                            size={!props.mobileScreen ? "medium" : "small"}
                          >
                            Add note
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                </CardActions>
                <RecordCardNote
                  isLoading={isLoading}
                  record={value}
                  mobileScreen={props.mobileScreen}
                  mutate={mutate}
                  note={note}
                  setNote={setNote}
                  is_prior={props.is_prior}
                />
              </Card>
            ))}
      </Stack>
    </Root>
  );
};

export default LabeledRecordCard;
