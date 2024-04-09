import React from "react";
import clsx from "clsx";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link as LinkIcon } from "@mui/icons-material";
import TruncateMarkup from "react-truncate-markup";

import { DOIIcon } from "icons";
import { RecordTrainingInfo, DecisionButton } from ".";
import { ExplorationModeRecordAlert } from "StyledComponents/StyledAlert";
import { StyledIconButton } from "StyledComponents/StyledButton";
import { useToggle } from "hooks/useToggle";

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

const RecordCard = ({
  project_id,
  record,
  afterDecision,
  mobileScreen,
  fontSize,
  tags,
  keyPressEnabled = false,
  collapseAbstract = false,
  disabled = false,
}) => {
  const [readMoreOpen, toggleReadMore] = useToggle();

  console.log(record);

  const isNotTrained =
    record?.state?.query_strategy === "top-down" ||
    record?.state?.query_strategy === "random";

  return (
    <Root aria-label="record card">
      <Card
        elevation={mobileScreen ? 0 : 2}
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
                variant={!mobileScreen ? "h5" : "h6"}
                sx={{
                  fontWeight: (theme) => theme.typography.fontWeightRegular,
                }}
              >
                {/* No title, inplace text */}
                {(record.title === "" || record.title === null) && (
                  <Box
                    className={"fontSize" + fontSize?.label}
                    fontStyle="italic"
                  >
                    No title available
                  </Box>
                )}

                {!(record.title === "" || record.title === null) && (
                  <Box className={"fontSize" + fontSize?.label}>
                    {record.title}
                  </Box>
                )}
              </Typography>
              {record?.state && <RecordTrainingInfo state={record.state} />}
            </Stack>
            <Stack direction="row" spacing={1}>
              {!(record.doi === undefined || record.doi === null) && (
                <StyledIconButton
                  className="record-card-icon"
                  href={"https://doi.org/" + record.doi}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DOIIcon />
                </StyledIconButton>
              )}

              {!(record.url === undefined || record.url === null) && (
                <Tooltip title="Open URL">
                  <StyledIconButton
                    className="record-card-icon"
                    href={record.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkIcon />
                  </StyledIconButton>
                </Tooltip>
              )}
            </Stack>

            <TruncateMarkup
              lines={collapseAbstract && !readMoreOpen ? 6 : Infinity}
              ellipsis={
                <span>
                  ...{" "}
                  <Link
                    component="button"
                    underline="none"
                    onClick={toggleReadMore}
                  >
                    read more
                  </Link>
                </span>
              }
            >
              <Typography
                component="div"
                className={classes.abstract + " fontSize" + fontSize?.label}
                variant="body2"
                paragraph
                sx={{ color: "text.secondary" }}
              >
                {(record.abstract === "" || record.abstract === null) && (
                  <Box fontStyle="italic">No abstract available</Box>
                )}

                {!(record.abstract === "" || record.abstract === null) && (
                  <Box>{record.abstract}</Box>
                )}
              </Typography>
            </TruncateMarkup>
          </Stack>
        </CardContent>
        <DecisionButton
          project_id={project_id}
          record_id={record.record_id}
          label={record.state?.included}
          labelFromDataset={record.included}
          afterDecision={afterDecision}
          note={record.note}
          tags={tags}
          tagValues={record.tag_values}
          keyPressEnabled={keyPressEnabled}
          disabled={disabled}
        />
      </Card>
    </Root>
  );
};

export default RecordCard;
