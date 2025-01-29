import { Link as LinkIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Fade,
  Grid2 as Grid,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";

import { StyledIconButton } from "StyledComponents/StyledButton";
import { useToggle } from "hooks/useToggle";
import { DOIIcon } from "icons";
import { RecordCardLabeler, RecordCardModelTraining } from ".";

import { fontSizeOptions } from "globals.js";

const transitionSpeed = 300;

const RecordCardContent = ({ record, fontSize, collapseAbstract }) => {
  const [readMoreOpen, toggleReadMore] = useToggle();

  return (
    <CardContent aria-label="record title abstract" sx={{ m: 1 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          {/* Show the title */}
          <Typography
            variant={"h5"}
            sx={(theme) => ({
              fontWeight: theme.typography.fontWeightRegular,
            })}
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
        </Stack>
        <Stack direction="row" spacing={1}>
          {!(record.doi === undefined || record.doi === null) && (
            <Tooltip title="Open DOI">
              <StyledIconButton
                className="record-card-icon"
                href={"https://doi.org/" + record.doi}
                target="_blank"
                rel="noreferrer"
              >
                <DOIIcon />
              </StyledIconButton>
            </Tooltip>
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

        {(record.abstract === "" || record.abstract === null) && (
          <Typography
            className={"fontSize" + fontSize}
            variant="body2"
            sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
            fontStyle={"italic"}
          >
            No abstract available
          </Typography>
        )}

        <Typography
          className={"fontSize" + fontSizeOptions[fontSize]}
          variant="body2"
          sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
        >
          {!(record.abstract === "" || record.abstract === null) &&
          collapseAbstract &&
          !readMoreOpen &&
          record.abstract.length > 500 ? (
            <>
              {record.abstract.substring(0, 500)}...
              <Link
                component="button"
                underline="none"
                onClick={toggleReadMore}
              >
                expand
              </Link>
            </>
          ) : (
            record.abstract
          )}
        </Typography>

        {record.keywords && (
          <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>
            {record.keywords.map((keyword, index) => (
              <span key={index}>
                {index > 0 && " • "}
                {keyword}
              </span>
            ))}
          </Typography>
        )}
      </Stack>
    </CardContent>
  );
};

const RecordCard = ({
  project_id,
  record,
  afterDecision = null,
  retrainAfterDecision = true,
  showBorder = true,
  fontSize = 1,
  modelLogLevel = "warning",
  showNotes = true,
  collapseAbstract = false,
  hotkeys = false,
  transitionType = "fade",
  landscape = false,
  changeDecision = true,
}) => {
  const [state, setState] = React.useState({ open: true });

  const styledRepoCard = (
    <Box>
      <RecordCardModelTraining
        record={record}
        modelLogLevel={modelLogLevel}
        sx={{ mb: 3, mx: 4 }}
      />
      <Card
        elevation={showBorder ? 4 : 0}
        sx={(theme) => ({
          bgcolor: theme.palette.background.record,
          borderRadius: !showBorder ? 0 : undefined,
        })}
      >
        <Grid
          container
          columns={5}
          sx={{ alignItems: "stretch" }}
          // divider={<Divider orientation="vertical" flexItem />}
        >
          <Grid size={landscape ? 3 : 5}>
            <RecordCardContent
              record={record}
              fontSize={fontSize}
              collapseAbstract={collapseAbstract}
            />
          </Grid>
          <Grid size={landscape ? 2 : 5}>
            <RecordCardLabeler
              key={
                "record-card-labeler-" +
                project_id +
                "-" +
                record?.record_id +
                "-" +
                record?.state?.note
              }
              project_id={project_id}
              record_id={record.record_id}
              label={record.state?.label}
              labelFromDataset={record.included}
              decisionCallback={() => setState({ open: false })}
              retrainAfterDecision={retrainAfterDecision}
              note={record.state?.note}
              labelTime={record.state?.time}
              user={record.state?.user}
              showNotes={showNotes}
              tagsForm={record.tags_form}
              tagValues={record.state?.tags}
              landscape={landscape}
              hotkeys={hotkeys}
              changeDecision={changeDecision}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
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
