import React from "react";
import { connect } from "react-redux";
import { InputBase, Paper, Stack, Typography, Link } from "@mui/material";
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
import { ProjectAPI } from "../../../api";
import { mapStateToProps, projectModes } from "../../../globals";
import { AddToDrive } from "@mui/icons-material";

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

const DatasetFromURL = ({ mode, addDataset }) => {
  const [localURL, setLocalURL] = React.useState("");
  const [resolvedURL, setResolvedURL] = React.useState("");

  const [data, setData] = React.useState(null);

  const { mutate: mutateResolve } = useMutation(ProjectAPI.resolveURL, {
    mutationKey: ["resolveURL"],
    onSuccess: (data) => {
      if (data["files"] && data["files"].length === 1) {
        mutate({ mode: mode, url: data["files"][0]["link"] });
      } else {
      }

      console.log(data);
    },
  });

  const { error, isError, isLoading, mutate } = useMutation(
    ProjectAPI.createProject,
    {
      mutationKey: ["addDataset"],
      onSuccess: (data, variables, context) => {
        console.log(data);
        console.log(variables);

        if (data["files"] && data["files"].length === 1) {
          // setResolvedURL(data["files"][0]["link"]);
        }
        // if validate is not set, close the dialog
        if (!variables["validate"]) {
          //   if (!isDatasetAdded()) {
          //     toggleProjectSetup(project_id);
          //   } else {
          //     queryClient.invalidateQueries([
          //       "fetchInfo",
          //       { project_id: project_id },
          //     ]);
          //     queryClient.invalidateQueries([
          //       "fetchData",
          //       { project_id: project_id },
          //     ]);
          addDataset(data);
        }
      },
      // },
    },
  );

  // handle the url input
  const handleURL = (event) => {
    setLocalURL(event.target.value);
  };

  const resolveURL = (event) => {
    mutateResolve({ url: localURL });
  };

  const validateURLOnEnter = (event) => {
    if (event.keyCode === 13) {
      resolveURL(event);
    }
  };

  // handle the file selection
  const handleFileChange = (event) => {
    setResolvedURL(event.target.value);
  };

  // add the dataset file to the project
  const addFile = (event) => {
    // import dataset
    mutate({ mode: mode, url: resolvedURL });
  };

  // reset the remote url when the local url changes
  React.useEffect(() => {
    setResolvedURL("");
  }, [localURL]);

  return (
    <Root>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Supported formats are RIS (<code>.ris</code>, <code>.txt</code>) and
        tabular datasets (<code>.csv</code>, <code>.tab</code>,{" "}
        <code>.tsv</code>, <code>.xlsx</code>). The dataset should contain a
        title and abstract for each record.{" "}
        {mode !== projectModes.ORACLE
          ? "The dataset should contain labels for each record. "
          : ""}
        To optimally benefit from the performance of the active learning model,
        it is highly recommended to add a dataset without duplicate records and
        complete records.{" "}
        <Link
          underline="none"
          href="https://asreview.readthedocs.io/en/latest/intro/datasets.html"
          target="_blank"
        >
          Learn more
        </Link>
      </Typography>
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
            onClick={resolveURL}
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
              value={resolvedURL}
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
              disabled={!resolvedURL}
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
