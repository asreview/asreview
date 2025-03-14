import React from "react";

import { ArrowForwardOutlined } from "@mui/icons-material";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

import { ProjectAPI } from "api";
import { InlineErrorHandler } from "Components";
import { StyledInputSearch } from "StyledComponents/StyledInputSearch";

import { useMutation } from "react-query";

const DatasetFromURI = ({ mode, setSetupProjectId }) => {
  const [localURI, setURI] = React.useState("");
  const [data, setData] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState("");

  const {
    isLoading: isResolving,
    mutate: mutateResolve,
    error: errorResolve,
  } = useMutation(ProjectAPI.resolveURI, {
    mutationKey: ["resolveURI"],
    onSuccess: (data) => {
      if (data["files"] && data["files"].length === 1) {
        createProject({ mode: mode, url: data["files"][0]["link"] });
      } else {
        setData(data["files"]);
      }
    },
  });

  const {
    error,
    isLoading,
    mutate: createProject,
  } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["createProject"],
    onSuccess: (data) => {
      setSetupProjectId(data.id);
    },
  });

  const addFile = () => {
    createProject({
      mode: mode,
      url: data[selectedFile].link,
      filename: data[selectedFile].name,
    });
  };

  return (
    <>
      <Stack spacing={3}>
        <StyledInputSearch
          autoFocus
          endIcon={<ArrowForwardOutlined />}
          disabled={isResolving || isLoading}
          placeholder="Type a URL or DOI of the dataset"
          value={localURI}
          loading={isResolving || isLoading}
          onChange={(event) => {
            setURI(event.target.value);
          }}
          onClick={() => {
            mutateResolve({ uri: localURI });
          }}
        />

        {data && (
          <>
            <FormControl
              sx={{ m: 1, minWidth: 120 }}
              disabled={isLoading || data.length === 1}
            >
              <InputLabel id="select-file-label">Select dataset</InputLabel>
              <Select
                labelId="select-file-label"
                id="select-file"
                value={selectedFile}
                label="Select dataset"
                onChange={(event) => {
                  setSelectedFile(event.target.value);
                }}
              >
                {data.map((val, i) => {
                  return (
                    <MenuItem key={i} value={i} disabled={val["disabled"]}>
                      {val["name"]}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Button loading={isLoading} onClick={addFile}>
              Download
            </Button>
          </>
        )}

        {errorResolve && <InlineErrorHandler message={errorResolve?.message} />}

        {error && (
          <InlineErrorHandler
            message={
              "Failed to create project for this dataset: " + error?.message
            }
          />
        )}
      </Stack>
    </>
  );
};

export default DatasetFromURI;
