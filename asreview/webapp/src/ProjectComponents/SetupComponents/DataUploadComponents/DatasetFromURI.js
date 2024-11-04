import React from "react";

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { ArrowForwardOutlined } from "@mui/icons-material";

import { ProjectAPI } from "api";
import { InlineErrorHandler } from "Components";
import { StyledInputSearch } from "StyledComponents/StyledInputSearch";

import { useMutation } from "react-query";

const DatasetFromURI = ({ mode, setSetupProjectId }) => {
  const [localURI, setURI] = React.useState("");
  const [data, setData] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState("");

  const { isLoading: isResolving, mutate: mutateResolve } = useMutation(
    ProjectAPI.resolveURI,
    {
      mutationKey: ["resolveURI"],
      onSuccess: (data) => {
        if (data["files"] && data["files"].length === 1) {
          createProject({ mode: mode, url: data["files"][0]["link"] });
        } else {
          setData(data["files"]);
        }
      },
    },
  );

  const {
    error,
    isError,
    isLoading,
    mutate: createProject,
  } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["createProject"],
    onSuccess: (data) => {
      setSetupProjectId(data.id);
    },
  });

  const resolveURI = () => {
    mutateResolve({ uri: localURI });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

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
          onClick={resolveURI}
          placeholder="Type a URL or DOI of the dataset"
          value={localURI}
          onChange={(event) => {
            setURI(event.target.value);
          }}
        />

        {/* <Paper
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          variant="outlined"
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            bgcolor: "white",
            borderRadius: 10,
            // "&.Mui-focused": {
            //   borderColor: "primary.main",
            // },

          }}
        >
          <InputBase
            autoFocus
            // disabled={isResolving || isLoading}
            // fullWidth
            id="dataset-url"
            placeholder="Type a URL or DOI of the dataset"
            value={localURI}
            onChange={handleURL}
            onKeyDown={validateURLOnEnter}
            sx={{ ml: 1, flex: 1 }}
          />
          <StyledLoadingButton
            disabled={isResolving || isLoading}
            loading={isResolving || isLoading}
            onClick={resolveURI}
            sx={{ minWidth: "32px" }}
          >
            <ArrowForwardOutlinedIcon />
          </StyledLoadingButton>
        </Paper> */}

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
                onChange={handleFileChange}
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
            <Stack alignItems={"center"}>
              <Button disabled={isLoading} onClick={addFile}>
                Add
              </Button>
            </Stack>
          </>
        )}

        {isError && (
          <InlineErrorHandler message={error?.message + " Please try again."} />
        )}
      </Stack>
    </>
  );
};

export default DatasetFromURI;
