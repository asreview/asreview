import * as React from "react";
import { connect } from "react-redux";
import { Stack, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DetailsModeSelect } from "../SetupComponents/DetailsComponents";
import { mapStateToProps } from "../../globals.js";

const Root = styled("div")(({ theme }) => ({
  width: "60%",
}));

const DetailsForm = (props) => {
  const handleDetailsChange = (event) => {
    props.setDetails({
      ...props.details,
      [event.target.name]: event.target.value,
    });
    props.setDisableButton(false);
  };

  return (
    <Root component="form" noValidate autoComplete="off">
      <Stack direction="column" spacing={3}>
        <DetailsModeSelect
          disableModeSelect={true}
          mode={props.details?.mode}
        />
        <TextField
          fullWidth
          autoFocus
          error={props.isError}
          required
          name="title"
          id="project-title"
          label="Title"
          onChange={handleDetailsChange}
          value={props.details.title}
          helperText={props.error?.message}
        />
        <TextField
          fullWidth
          name="authors"
          id="project-author"
          label="Author(s)"
          onChange={handleDetailsChange}
          value={props.details?.authors}
        />
        <TextField
          fullWidth
          multiline
          minRows={8}
          name="description"
          id="project-description"
          label="Description"
          onChange={handleDetailsChange}
          value={props.details?.description}
        />
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(DetailsForm);
