import React from "react";
import clsx from "clsx";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Slide,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "@mui/icons-material";

import { BoxErrorHandler } from "Components";
import { DOIIcon } from "icons";
import { NoteSheet, RecordTrainingInfo, DecisionButton } from ".";
import { ExplorationModeRecordAlert } from "StyledComponents/StyledAlert";
import { StyledIconButton } from "StyledComponents/StyledButton";

const PREFIX = "RecordCard";

const classes = {
  loadedCard: `${PREFIX}-loadedCard`,
  loadingCard: `${PREFIX}-loadingCard`,
  titleAbstract: `${PREFIX}-titleAbstract`,
  title: `${PREFIX}-title`,
  abstract: `${PREFIX}-abstract`,
  note: `${PREFIX}-note`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 0 auto",
  margin: "auto",
  maxWidth: 960,
  padding: "64px 0px 32px 0px",
  height: "100%",
  [theme.breakpoints.down("md")]: {
    padding: "4px 0px",
  },
  [`& .${classes.loadedCard}`]: {
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      borderRadius: 0,
    },
  },

  [`& .${classes.loadingCard}`]: {
    justifyContent: "center",
    alignItems: "center",
  },

  [`& .${classes.titleAbstract}`]: {
    height: "100%",
    overflowY: "scroll",
  },

  [`& .${classes.title}`]: {
    lineHeight: 1.2,
  },

  [`& .${classes.abstract}`]: {
    whiteSpace: "pre-line",
  },

  [`& .${classes.note}`]: {
    justifyContent: "flex-end",
  },
}));

const RecordCard = (props) => {
  const isNotTrained =
    props.activeRecord?.query_strategy === "top-down" ||
    props.activeRecord?.query_strategy === "random";

  return (
    <Root aria-label="record card">
      {!props.isError && !props.activeRecord && (
        <Card
          elevation={2}
          className={clsx(classes.loadedCard, classes.loadingCard)}
        >
          <CardContent aria-label="record loading">
            <CircularProgress />
          </CardContent>
        </Card>
      )}
      {props.isError && (
        <Card
          elevation={2}
          className={clsx(classes.loadedCard, classes.loadingCard)}
          aria-label="record loaded failure"
        >
          <BoxErrorHandler queryKey="fetchRecord" error={props.error} />
        </Card>
      )}
      {props.activeRecord && (
        <Card
          elevation={2}
          className={classes.loadedCard}
          aria-label="record loaded"
        >
          {isNotTrained && (
            <Alert
              severity="warning"
              className="record-card-alert"
              sx={{ borderRadius: 0 }}
            >
              This record is not presented by the model
            </Alert>
          )}

          <CardContent
            className={`${classes.titleAbstract} record-card-content`}
            aria-label="record title abstract"
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                spacing={1}
              >
                {/* Show the title */}
                <Typography
                  component="div"
                  className={classes.title}
                  variant={!props.mobileScreen ? "h5" : "h6"}
                  sx={{
                    fontWeight: (theme) => theme.typography.fontWeightRegular,
                  }}
                >
                  {/* No title, inplace text */}
                  {(props.activeRecord.title === "" ||
                    props.activeRecord.title === null) && (
                    <Box
                      className={"fontSize" + props.fontSize.label}
                      fontStyle="italic"
                    >
                      No title available
                    </Box>
                  )}

                  {!(
                    props.activeRecord.title === "" ||
                    props.activeRecord.title === null
                  ) && (
                    <Box className={"fontSize" + props.fontSize.label}>
                      {props.activeRecord.title}
                    </Box>
                  )}
                </Typography>
                <RecordTrainingInfo state={props.activeRecord.state} />
              </Stack>
              <Stack direction="row" spacing={1}>
                {!(
                  props.activeRecord.doi === undefined ||
                  props.activeRecord.doi === null
                ) && (
                  <StyledIconButton
                    className="record-card-icon"
                    href={"https://doi.org/" + props.activeRecord.doi}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DOIIcon />
                  </StyledIconButton>
                )}

                {!(
                  props.activeRecord.url === undefined ||
                  props.activeRecord.url === null
                ) && (
                  <Tooltip title="Open URL">
                    <StyledIconButton
                      className="record-card-icon"
                      href={props.activeRecord.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Link />
                    </StyledIconButton>
                  </Tooltip>
                )}
              </Stack>
              <Typography
                component="div"
                className={
                  classes.abstract + " fontSize" + props.fontSize.label
                }
                variant="body2"
                paragraph
                sx={{ color: "text.secondary" }}
              >
                {(props.activeRecord.abstract === "" ||
                  props.activeRecord.abstract === null) && (
                  <Box fontStyle="italic">No abstract available</Box>
                )}

                {!(
                  props.activeRecord.abstract === "" ||
                  props.activeRecord.abstract === null
                ) && <Box>{props.activeRecord.abstract}</Box>}
              </Typography>
            </Stack>
          </CardContent>
          <DecisionButton
            // disableButton={props.disableButton}
            makeDecision={props.makeDecision}
            labelFromDataset={props.activeRecord?.label_from_dataset}
            mobileScreen={props.mobileScreen}
            // previousRecord={props.previousRecord}
            tags={props.tags}
            // tagValues={props.tagValues}
            // setTagValues={props.setTagValues}
            keyPressEnabled={props.keyPressEnabled}
          />
        </Card>
      )}
    </Root>
  );
};

export default RecordCard;
