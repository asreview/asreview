import React from "react";
import { connect } from "react-redux";
import { InputBase, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation, useQueryClient } from "react-query";

import LoadingButton from "@mui/lab/LoadingButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { InlineErrorHandler } from "../../../Components";
import { StyledLoadingButton } from "../../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps } from "../../../globals.js";

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
  const queryClient = useQueryClient();

  const [localURL, setLocalURL] = React.useState("");
  const [remoteURL, setRemoteURL] = React.useState("");

  const datasetInfo = queryClient.getQueryData([
    "fetchData",
    { project_id: props.project_id },
  ]);

  const isDatasetAdded = () => {
    return datasetInfo !== undefined;
  };

  const { error, isError, isLoading, mutate, data } = useMutation(
    ProjectAPI.mutateData,
    {
      mutationKey: ["addDataset"],
      onSuccess: (data, variables, context) => {
        // if validate is set and there is only one file, select it
        if (data["files"] && data["files"].length === 1) {
          setRemoteURL(data["files"][0]["link"]);
        }
        // if validate is not set, close the dialog
        if (!variables["validate"]) {
          if (!isDatasetAdded()) {
            props.toggleProjectSetup();
          } else {
            queryClient.invalidateQueries([
              "fetchInfo",
              { project_id: props.project_id },
            ]);
            queryClient.invalidateQueries([
              "fetchData",
              { project_id: props.project_id },
            ]);
          }
          props.toggleImportDataset();
        }
      },
    },
  );

  // handle the url input
  const handleURL = (event) => {
    setLocalURL(event.target.value);
  };

  const validateURL = (event) => {
    // validate the url first
    mutate({ project_id: props.project_id, url: localURL, validate: true });
  };

  const validateURLOnEnter = (event) => {
    if (event.keyCode === 13) {
      validateURL(event);
    }
  };

  // handle the file selection
  const handleFileChange = (event) => {
    setRemoteURL(event.target.value);
  };

  // add the dataset file to the project
  const addFile = (event) => {
    // import dataset
    mutate({ project_id: props.project_id, url: remoteURL });
  };

  // reset the remote url when the local url changes
  React.useEffect(() => {
    setRemoteURL("");
  }, [localURL]);

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
            disabled={isLoading}
            fullWidth
            id="url-dataset"
            placeholder="Type a URL or DOI of the dataset"
            value={localURL}
            onChange={handleURL}
            onKeyDown={validateURLOnEnter}
            sx={{ ml: 1, flex: 1 }}
          />
          <StyledLoadingButton
            disabled={!localURL || isLoading}
            loading={isLoading}
            onClick={validateURL}
            sx={{ minWidth: "32px" }}
          >
            <ArrowForwardOutlinedIcon />
          </StyledLoadingButton>
        </Paper>

        {data && data["files"] && (
          <FormControl
            sx={{ m: 1, minWidth: 120 }}
            disabled={isLoading || data["files"].length === 1}
          >
            <InputLabel id="select-file-label">Select dataset</InputLabel>
            <Select
              labelId="select-file-label"
              id="select-file"
              value={remoteURL}
              label="Select dataset"
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
          </FormControl>
        )}

        {data && data["files"] && (
          <Stack className={classes.root}>
            <LoadingButton
              disabled={!remoteURL}
              loading={isLoading}
              onClick={addFile}
            >
              Add
            </LoadingButton>
          </Stack>
        )}

        {isError && (
          <InlineErrorHandler message={error?.message + " Please try again."} />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(DatasetFromURL);
