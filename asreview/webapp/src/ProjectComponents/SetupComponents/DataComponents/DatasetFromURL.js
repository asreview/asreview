import React from "react";
import { InputBase, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation } from "react-query";

import LoadingButton from "@mui/lab/LoadingButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { InlineErrorHandler } from "../../../Components";
import { StyledLoadingButton } from "../../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../../api/index.js";

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
  const [localURL, setLocalURL] = React.useState("");

  const { error, isError, isLoading, mutate, data } = useMutation(
    ProjectAPI.mutateData,
    {
      onSuccess: (data, variables, context) => {
        if (data["files"] && data["files"].length === 1) {
          props.setURL(data["files"][0]["link"]);
        }
      },
    }
  );

  const handleURL = (event) => {
    setLocalURL(event.target.value);
  };

  const addURL = (event) => {
    // validate the url first
    mutate({ project_id: props.project_id, url: localURL, validate: true });
  };

  const addURLOnEnter = (event) => {
    if (event.keyCode === 13) {
      addURL(event);
    }
  };

  const addFile = (event) => {
    // upload dataset
    props.handleSaveDataset();
  };

  const handleFileChange = (event) => {
    props.setURL(event.target.value);
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
            disabled={props.isAddingDataset || isLoading}
            fullWidth
            id="url-dataset"
            placeholder="Type a URL or DOI of the dataset"
            value={localURL}
            onChange={handleURL}
            onKeyDown={addURLOnEnter}
            sx={{ ml: 1, flex: 1 }}
          />
          <StyledLoadingButton
            disabled={!localURL || props.isAddingDataset}
            loading={isLoading}
            onClick={addURL}
            sx={{ minWidth: "32px" }}
          >
            <ArrowForwardOutlinedIcon />
          </StyledLoadingButton>
        </Paper>

        {data && data["files"] && (
          <FormControl
            sx={{ m: 1, minWidth: 120 }}
            disabled={props.isAddingDataset || data["files"].length === 1}
          >
            <InputLabel id="select-file-label">File</InputLabel>
            <Select
              labelId="select-file-label"
              id="select-file"
              value={props.url}
              label="File"
              onChange={handleFileChange}
            >
              {data["files"].map((val, id) => {
                return (
                  <MenuItem
                    key={val["name"]}
                    value={val["link"]}
                    disabled={val["disabled"]}
                  >
                    {val["name"]}
                  </MenuItem>
                );
              })}
            </Select>
            {data && data["files"] && data["files"].length > 1 && (
              <FormHelperText>
                Multiple files found. Select the file you want to use.
              </FormHelperText>
            )}
          </FormControl>
        )}

        {data && data["files"] && (
          <Stack className={classes.root}>
            <LoadingButton
              disabled={!props.url}
              loading={props.isAddingDataset || isLoading}
              onClick={addFile}
            >
              Add
            </LoadingButton>
          </Stack>
        )}

        {isError && (
          <InlineErrorHandler
            message={error?.message + " Use a valid URL or DOI."}
          />
        )}
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
