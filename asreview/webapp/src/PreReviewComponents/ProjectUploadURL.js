import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "ProjectUploadURL";

const classes = {
  root: `${PREFIX}-root`,
  uploadButton: `${PREFIX}-uploadButton`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    paddingTop: "24px",
  },

  [`& .${classes.uploadButton}`]: {
    marginTop: "26px",
  },
}));

const ProjectUploadURL = (props) => {
  const [url, setURL] = useState("");

  const onChangeURL = (evt) => {
    props.setError(null);
    setURL(evt.target.value);
  };

  const submitForm = (evt) => {
    evt.preventDefault();

    // start the request
    props.onUploadHandler(url);
  };

  return (
    <Root>
      <div className={classes.input}>
        <form
          className={classes.root}
          noValidate
          autoComplete="off"
          onSubmit={submitForm}
        >
          <TextField
            fullWidth
            id="url-dataset"
            label="Dataset URL"
            value={url}
            onChange={onChangeURL}
          />
        </form>

        {props.error === null && url !== "" && (
          <div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={props.upload}
              onClick={submitForm}
              className={classes.uploadButton}
            >
              {props.upload ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
      </div>
    </Root>
  );
};

export default ProjectUploadURL;
