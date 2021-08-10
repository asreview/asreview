import React from "react";
import {
  Card,
  CardContent,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  cardContent: {
    paddingTop: 0,
  },
  action: {
    display: "flex",
    justifyContent: "space-between",
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
      <CardContent className={classes.cardContent}>
        <div className={classes.action}>
          <Typography className={classes.title} variant="subtitle1">
            Note
          </Typography>
          <div>
            <Tooltip title="Save">
              <IconButton onClick={props.toggleNoteSheet}>
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <Divider />
        <form>
          <TextField
            id="note"
            autoFocus
            fullWidth
            multiline
            onChange={props.onChangeNote}
            placeholder="Write something......"
            rows={4}
            value={props.note ? props.note : ""}
            variant="outlined"
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default NoteSheet;
