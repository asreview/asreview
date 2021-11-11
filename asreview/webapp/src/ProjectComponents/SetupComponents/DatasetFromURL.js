import React from "react";
import { Box, Stack, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";

const PREFIX = "DatasetFromURL";

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

const DatasetFromURL = (props) => {
  const handleURL = (event) => {
    if (props.isAddDatasetError) {
      props.reset();
    }
    props.setURL(event.target.value);
  };

  return (
    <Root>
      <Stack spacing={3}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <TextField
            disabled={props.isAddingDataset}
            fullWidth
            id="url-dataset"
            label="Dataset URL"
            value={props.url}
            onChange={handleURL}
          />
        </Box>
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
