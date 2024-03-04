import React from "react";
import {
  Box,
  Fab,
  Stack,
  Tooltip,
  Chip,
  CardActions,
  Button,
  Divider,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import "./ReviewPage.css";
import { useKeyPress } from "hooks/useKeyPress";
import { useToggle } from "hooks/useToggle";

import { NoteSheet, TagsTable } from ".";

const PREFIX = "DecisionButton";

const classes = {
  extendedFab: `${PREFIX}-extendedFab`,
};

const Root = styled("div")(({ theme }) => ({
  // [`& .${classes.extendedFab}`]: {
  //   marginRight: theme.spacing(1),
  // },
}));

const DecisionButton = (props) => {
  const [showNotes, toggleShowNotes] = useToggle(false);
  const [showTags, toggleShowTags] = useToggle(false);
  const [note, setNote] = React.useState(props.activeRecord?.note);
  const [tagValues, setTagValues] = React.useState(
    props.activeRecord?.tag_values,
  );

  const tagValuesEqual = (tagValues1, tagValues2) => {
    if (tagValues1 === null || tagValues2 === null) {
      return tagValues1 === null && tagValues2 === null;
    }

    const keys1 = Object.keys(tagValues1);
    const keys2 = Object.keys(tagValues2);
    const union = new Set(keys1.concat(keys2));
    return union.size === keys1.length && union.size === keys2.length;
  };

  let relevantLabel = "Yes";
  let irrelevantLabel = "No";

  // if (props.previousRecord.show) {
  //   if (props.previousRecord.label === 0) {
  //     relevantLabel = "Convert to relevant";
  //     irrelevantLabel = "Keep irrelevant";
  //   }
  //   if (props.previousRecord.label === 1) {
  //     relevantLabel = "Keep relevant";
  //     irrelevantLabel = "Convert to irrelevant";
  //   }
  // }

  /**
   * Use keyboard shortcuts
   */

  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  // const undoPress = useKeyPress("u");
  const notePress = useKeyPress("n");
  const tagsPress = useKeyPress("t");

  React.useEffect(() => {
    if (props.keyPressEnabled) {
      if (relevantPress) {
        props.makeDecision(1);
      }
      if (irrelevantPress) {
        props.makeDecision(0);
      }
      if (notePress) {
        toggleShowNotes();
      }

      if (tagsPress) {
        toggleShowTags();
      }
    }
  }, [relevantPress, irrelevantPress, notePress, tagsPress]);

  return (
    <Root>
      {showTags && (
        <>
          <Divider>
            <Chip label="Extra labels & notes" size="small" />
          </Divider>
          <CardContent>
            {Array.isArray(props.tags) && props.tags.length > 0 && (
              <TagsTable
                tags={props.tags}
                tagValues={tagValues}
                setTagValues={setTagValues}
              />
            )}
          </CardContent>
        </>
      )}

      {showNotes && (
        <>
          <Divider />
          <CardContent>
            <NoteSheet note={note} setNote={setNote} />
          </CardContent>
        </>
      )}

      <Stack
        className="review-page-decision-button"
        // direction={
        //   !props.mobileScreen
        //     ? "row"
        //     : !props.previousRecord.show
        //       ? "row"
        //       : "column"
        // }
        // spacing={!props.mobileScreen ? 10 : !props.previousRecord.show ? 10 : 2}
      >
        {/* <Box>
          <Tooltip
            open={props.labelFromDataset === 0}
            title="Label in dataset is irrelevant"
            placement="top"
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
          >
            <Fab
              id="irrelevant"
              disabled={props.disableButton()}
              onClick={() => props.makeDecision(0)}
              size={props.mobileScreen ? "small" : "large"}
              variant="extended"
            >
              <FavoriteBorder className={classes.extendedFab} />
              {irrelevantLabel}
            </Fab>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip
            open={props.labelFromDataset === 1}
            title="Label in dataset is relevant"
            placement="top"
            disableFocusListener
            disableHoverListener
            disableTouchListener
            arrow
          >
            <Fab
              id="relevant"
              onClick={() => props.makeDecision(1)}
              color="primary"
              disabled={props.disableButton()}
              size={props.mobileScreen ? "small" : "large"}
              variant="extended"
            >
              <Favorite className={classes.extendedFab} />
              {relevantLabel}
            </Fab>
          </Tooltip>
        </Box> */}
      </Stack>

      <Divider />
      <CardActions>
        <Button
          id="relevant"
          onClick={() => props.makeDecision(1)}
          variant="extended"
        >
          <Favorite className={classes.extendedFab} />
          {relevantLabel}
        </Button>
        <Button
          id="irrelevant"
          onClick={() => props.makeDecision(0)}
          variant="extended"
        >
          <FavoriteBorder className={classes.extendedFab} />
          {irrelevantLabel}
        </Button>
      </CardActions>
    </Root>
  );
};

export default DecisionButton;
