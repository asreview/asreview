import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "NoteSheet";

const classes = {
  root: `${PREFIX}-root`,
  note: `${PREFIX}-note`,
  button: `${PREFIX}-button`,
  title: `${PREFIX}-title`,
};

const StyledCard = styled(Card)({
  [`&.${classes.root}`]: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  [`& .${classes.note}`]: {
    paddingTop: 32,
  },
  [`& .${classes.button}`]: {
    justifyContent: "flex-end",
    paddingRight: 16,
  },
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "center",
  },
});

const NoteSheet = (props) => {
  const [disableUndoButton, setDisableUndoButton] = React.useState(true);
  const handleNote = (event) => {
    props.setRecordNote((s) => {
      return {
        ...s,
        data: event.target.value,
      };
    });
    setDisableUndoButton(false);
  };

  const handleClickUndoChanges = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: false,
        data: !props.previousRecord.show ? "" : props.previousRecord.note,
      };
    });
    setDisableUndoButton(true);
  };

  return (
    <StyledCard className={classes.root} variant="outlined">
      <CardContent className={classes.note}>
        <Box>
          <TextField
            autoComplete="off"
            id="multiline-note"
            label="Note"
            autoFocus={props.noteFieldAutoFocus()}
            fullWidth
            multiline
            onChange={handleNote}
            placeholder={`Autosaved when this record is labeled as relevant or irrelevant. View your note in "History" on the left menu.`}
            rows={4}
            value={props.note ? props.note : ""}
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions className={classes.button}>
        <Button
          color="primary"
          disabled={disableUndoButton}
          size="small"
          onClick={handleClickUndoChanges}
        >
          Undo Changes
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default NoteSheet;
