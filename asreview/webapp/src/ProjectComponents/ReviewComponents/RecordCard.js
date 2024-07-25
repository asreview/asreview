import React from "react";
import { Link as LinkIcon } from "@mui/icons-material";
import {
  Fade,
  Collapse,
  Alert,
  Box,
  Card,
  CardContent,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { StyledIconButton } from "StyledComponents/StyledButton";
import { useToggle } from "hooks/useToggle";
import { DOIIcon } from "icons";
import { DecisionButton, RecordTrainingInfo } from ".";

import { fontSizeOptions } from "globals.js";

const PREFIX = "RecordCard";

const classes = {
  loadedCard: `${PREFIX}-loadedCard`,
  titleAbstract: `${PREFIX}-titleAbstract`,
  title: `${PREFIX}-title`,
  abstract: `${PREFIX}-abstract`,
};

const StyledCard = styled(Card)(() => ({
  // [`& .${classes.titleAbstract}`]: {
  //   height: "100%",
  //   overflowY: "scroll",
  // },
  // [`& .${classes.title}`]: {
  //   lineHeight: 1.2,
  // },
  [`& .${classes.abstract}`]: {
    whiteSpace: "pre-line",
  },
}));

const transitionSpeed = 150;

const RecordCard = ({
  project_id,
  record,
  afterDecision = null,
  retrainAfterDecision = true,
  showBorder = true,
  fontSize = 1,
  showNotes = true,
  collapseAbstract = false,
  hotkeys = false,
  transitionType = "fade",
}) => {
  const [readMoreOpen, toggleReadMore] = useToggle();

  const [state, setState] = React.useState({
    open: true,
  });

  const isNotTrained =
    record?.state?.query_strategy === "top-down" ||
    record?.state?.query_strategy === "random";

  const decisionCallback = () => {
    setState({
      open: false,
    });
  };

  const styledRepoCard = (
    <StyledCard elevation={showBorder ? 2 : 0}>
      {isNotTrained && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          This record is not presented by the model
        </Alert>
      )}
      {record?.error?.type !== undefined && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          Model training error: {record?.error?.message}. Change model in
          settings page.
        </Alert>
      )}

      <CardContent
        className={classes.titleAbstract}
        aria-label="record title abstract"
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            {/* Show the title */}
            <Typography
              component="div"
              className={classes.title}
              variant={"h5"}
              sx={{
                fontWeight: (theme) => theme.typography.fontWeightRegular,
              }}
            >
              {/* No title, inplace text */}
              {(record.title === "" || record.title === null) && (
                <Box
                  className={"fontSize" + fontSizeOptions[fontSize]}
                  fontStyle="italic"
                >
                  No title available
                </Box>
              )}

              {!(record.title === "" || record.title === null) && (
                <Box className={"fontSize" + fontSizeOptions[fontSize]}>
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

          <Typography
            component="div"
            className={
              classes.abstract + " fontSize" + fontSizeOptions[fontSize]
            }
            variant="body2"
            paragraph
            sx={{ color: "text.secondary" }}
          >
            {(record.abstract === "" || record.abstract === null) && (
              <Box fontStyle="italic">No abstract available</Box>
            )}

            {!(record.abstract === "" || record.abstract === null) &&
            collapseAbstract &&
            !readMoreOpen &&
            record.abstract.length > 500 ? (
              <Box>
                {record.abstract.substring(0, 500)}...
                <Link
                  component="button"
                  underline="none"
                  onClick={toggleReadMore}
                >
                  expand
                </Link>
              </Box>
            ) : (
              record.abstract
            )}
          </Typography>
        </Stack>
      </CardContent>
      <DecisionButton
        project_id={project_id}
        record_id={record.record_id}
        label={record.state?.label}
        labelFromDataset={record.included}
        decisionCallback={decisionCallback}
        retrainAfterDecision={retrainAfterDecision}
        note={record.state?.note}
        labelDatetime={record.state?.labeling_time}
        showNotes={showNotes}
        tagsForm={record.tags_form}
        tagValues={record.state?.tags}
        hotkeys={hotkeys}
      />
    </StyledCard>
  );

  if (transitionType === "fade") {
    return (
      <Fade
        in={state.open}
        timeout={transitionSpeed}
        onExited={afterDecision}
        unmountOnExit
      >
        {styledRepoCard}
      </Fade>
    );
  } else if (transitionType === "collapse") {
    return (
      <Collapse
        in={state.open}
        timeout={transitionSpeed}
        onExited={afterDecision}
        unmountOnExit
      >
        {styledRepoCard}
      </Collapse>
    );
  } else {
    return styledRepoCard;
  }
};

export default RecordCard;
