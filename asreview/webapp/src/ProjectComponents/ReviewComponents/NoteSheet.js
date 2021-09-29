import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  note: {
    paddingTop: 32,
  },
  button: {
    // display: "flex",
    justifyContent: "flex-end",
  },
  title: {
    display: "flex",
    alignItems: "center",
  },
});

const NoteSheet = (props) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent className={classes.note}>
        <Box>
          <TextField
            id="multiline-note"
            label="Note"
            autoFocus
            fullWidth
            multiline
            onChange={props.onChangeNote}
            placeholder="Write something......"
            rows={4}
            value={props.note ? props.note : ""}
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions className={classes.button}>
        <Button color="primary" size="small" onClick={props.discardNote}>
          Discard Changes
        </Button>
        <Button
          color="primary"
          disabled={!props.note}
          size="small"
          onClick={props.saveNote}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

export default NoteSheet;
