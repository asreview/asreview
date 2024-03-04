import React from "react";
import { Box, Stack, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "NoteSheet";

const classes = {
  textfield: `${PREFIX}-text-field`,
  button: `${PREFIX}-button`,
};

const Root = styled("div")({
  // [`& .${classes.textfield}`]: {
  //   paddingLeft: 16,
  //   paddingRight: 16,
  // },
  // [`& .${classes.button}`]: {
  //   display: "flex",
  //   justifyContent: "flex-end",
  //   paddingRight: 16,
  // },
});

const NoteSheet = ({ note, setNote }) => {
  const [showNoteChange, setShowNoteChange] = React.useState(false);

  const handleNote = (event) => {
    setNote(event.target.value);
    setShowNoteChange(true);
  };

  return (
    <Box>
      <Stack spacing={1}>
        <Box className={classes.textfield}>
          <TextField
            autoComplete="off"
            id="record-note"
            label="Note"
            // autoFocus={noteFieldAutoFocus()}
            fullWidth
            helperText={
              showNoteChange && "Note is saved when label decision is made."
            }
            multiline
            onChange={handleNote}
            placeholder="Write a note for this record..."
            rows={4}
            value={note ? note : ""}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default NoteSheet;
