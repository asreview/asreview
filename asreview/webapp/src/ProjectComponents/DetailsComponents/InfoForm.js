import * as React from "react";
import { connect } from "react-redux";
import { Stack, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DetailsModeSelect } from "../SetupComponents/DetailsComponents";
import { MouseOverPopover } from "../../StyledComponents/StyledPopover.js";
import { StyledTypoSubtitle1Medium } from "../../StyledComponents/StyledTypography.js";
import { mapStateToProps } from "../../globals.js";

const Root = styled("div")(({ theme }) => ({}));

const InfoForm = (props) => {
  const handleInfoChange = (event) => {
    props.setInfo({
      ...props.info,
      [event.target.name]: event.target.value,
    });
    props.setDisableButton(false);
  };

  return (
    <Root style={{ width: !props.mobileScreen ? "60%" : "100%" }}>
      <Stack direction="column" spacing={2}>
        <StyledTypoSubtitle1Medium text="Basic information" />
        <MouseOverPopover title="Select mode when creating a new project">
          <DetailsModeSelect disableModeSelect={true} mode={props.info?.mode} />
        </MouseOverPopover>
        <TextField
          autoComplete="off"
          autoFocus
          error={props.isError}
          fullWidth
          helperText={props.error?.message}
          id="project-title"
          label="Title"
          name="title"
          onChange={handleInfoChange}
          required
          value={props.info.title}
        />
        <TextField
          autoComplete="off"
          fullWidth
          id="project-author"
          label="Author(s)"
          name="authors"
          onChange={handleInfoChange}
          value={props.info?.authors}
        />
        <TextField
          autoComplete="off"
          fullWidth
          id="project-description"
          label="Description"
          multiline
          minRows={8}
          name="description"
          onChange={handleInfoChange}
          value={props.info?.description}
        />
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(InfoForm);
