import React from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { KeyboardArrowDown } from "@mui/icons-material";

const PREFIX = "NoteSheet";

const classes = {
  textfield: `${PREFIX}-text-field`,
  button: `${PREFIX}-button`,
};

const Root = styled("div")({
  [`& .${classes.textfield}`]: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  [`& .${classes.button}`]: {
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 16,
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

  const handleClickRemoveNote = () => {
    props.setRecordNote((s) => {
      return {
        ...s,
        expand: false,
        data: "",
      };
    });
  };

  return (
    <Root>
      <Card
        variant="outlined"
        sx={{ borderTopRightRadius: 16, borderTopLeftRadius: 16 }}
      >
        <CardContent>
          <Stack spacing={1}>
            <Box className={classes.button}>
              <Tooltip title="Remove note">
                <IconButton onClick={handleClickRemoveNote}>
                  <KeyboardArrowDown />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className={classes.textfield}>
              <TextField
                autoComplete="off"
                id="multiline-note"
                label="Note"
                autoFocus={props.noteFieldAutoFocus()}
                fullWidth
                helperText="Save the note by labeling the record as relevant or irrelevant"
                multiline
                onChange={handleNote}
                placeholder="Write something..."
                rows={4}
                value={props.note ? props.note : ""}
                variant="outlined"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Root>
  );
};

export default NoteSheet;
