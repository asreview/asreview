import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: "24px",
  },
  uploadButton: {
    marginTop: "26px",
  },
}));

const ProjectUploadURL = (props) => {
  const classes = useStyles();

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
    <div>
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
    </div>
  );
};

export default ProjectUploadURL;
