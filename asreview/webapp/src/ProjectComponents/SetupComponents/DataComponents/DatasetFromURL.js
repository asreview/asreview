import React from "react";
import { InputBase, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";

import { InlineErrorHandler } from "../../../Components";

const PREFIX = "DatasetFromURL";

const classes = {
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    alignItems: "center",
  },

  [`& .${classes.input}`]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "4px 8px",
  },
}));

const DatasetFromURL = (props) => {
  const handleURL = (event) => {
    if (props.isAddDatasetError) {
      props.reset();
    }
    props.setURL(event.target.value);
  };

  const addURL = () => {
    props.handleSaveDataset();
  };

  return (
    <Root>
      <Stack spacing={3}>
        <Paper
          className={classes.input}
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          variant="outlined"
        >
          <InputBase
            autoFocus
            disabled={props.isAddingDataset}
            fullWidth
            id="url-dataset"
            placeholder="Dataset URL"
            value={props.url}
            onChange={handleURL}
            sx={{ ml: 1, flex: 1 }}
          />
          <LoadingButton
            disabled={!props.url}
            loading={props.isAddingDataset}
            onClick={addURL}
          >
            Add
          </LoadingButton>
        </Paper>
        {props.isAddDatasetError && (
          <InlineErrorHandler
            message={props.addDatasetError?.message + " Please try again."}
          />
        )}
      </Stack>
    </Root>
  );
};

export default DatasetFromURL;
