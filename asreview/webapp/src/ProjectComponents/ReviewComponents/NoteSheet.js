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
  },
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "center",
  },
});

const NoteSheet = (props) => {
  const handleNote = (event) => {
    props.setRecordNote((s) => {
      return {
        ...s,
        data: event.target.value,
      };
    });
  };

  const discardNote = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: false,
        data: null,
      };
    });
  };

  return (
    <StyledCard className={classes.root} variant="outlined">
      <CardContent className={classes.note}>
        <Box>
          <TextField
            id="multiline-note"
            label="Note"
            autoFocus={props.noteFieldAutoFocus()}
            fullWidth
            multiline
            onChange={handleNote}
            placeholder="Autosaved when this record is labeled as relevant or irrelevant"
            rows={4}
            value={props.note ? props.note : ""}
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions className={classes.button}>
        <Button color="primary" size="small" onClick={discardNote}>
          Discard Changes
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default NoteSheet;
