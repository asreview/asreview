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
    // display: "flex",
    justifyContent: "flex-end",
  },
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "center",
  },
});

const NoteSheet = (props) => {
  return (
    <StyledCard className={classes.root} variant="outlined">
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
    </StyledCard>
  );
};

export default NoteSheet;
