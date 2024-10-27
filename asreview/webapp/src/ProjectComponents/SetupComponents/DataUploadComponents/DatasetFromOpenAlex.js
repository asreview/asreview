import React from "react";

import { InputBase, Paper, Stack, Typography } from "@mui/material";
import { useMutation } from "react-query";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { InlineErrorHandler } from "Components";
import { StyledLoadingButton } from "StyledComponents/StyledButton";
import { ProjectAPI } from "api";

const DatasetFromOpenAlex = ({ mode, setDataset }) => {
  const [localURI, setURI] = React.useState("");
  //   const [data, setData] = React.useState(null);
  //   const [selectedFile, setSelectedFile] = React.useState("");

  //   const { isLoading: isResolving, mutate: mutateResolve } = useMutation(
  //     ProjectAPI.resolveURI,
  //     {
  //       mutationKey: ["resolveURI"],
  //       onSuccess: (data) => {
  //         if (data["files"] && data["files"].length === 1) {
  //           createProject({ mode: mode, url: data["files"][0]["link"] });
  //         } else {
  //           setData(data["files"]);
  //         }
  //       },
  //     },
  //   );

  const { error, isError } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["createProject"],
    onSuccess: (data) => {
      setDataset(data);
    },
  });

  //   const handleURL = (event) => {
  //     setURI(event.target.value);
  //   };

  //   const resolveURI = () => {
  //     mutateResolve({ uri: localURI });
  //   };

  //   const validateURLOnEnter = (event) => {
  //     if (event.keyCode === 13) {
  //       resolveURI(event);
  //     }
  //   };

  //   const handleFileChange = (event) => {
  //     setSelectedFile(event.target.value);
  //   };

  //   const addFile = () => {
  //     createProject({
  //       mode: mode,
  //       url: data[selectedFile].link,
  //       filename: data[selectedFile].name,
  //     });
  //   };

  return (
    <>
      <Stack spacing={3}>
        <Paper
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          variant="outlined"
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            bgcolor: "#ffffff",
          }}
        >
          <InputBase
            autoFocus
            disabled
            // disabled= {isResolving || isLoading}
            fullWidth
            id="url-dataset"
            placeholder="Search in OpenAlex"
            value={localURI}
            // onChange={handleURL}
            // onKeyDown={validateURLOnEnter}
            sx={{ ml: 1, flex: 1 }}
          />
          <StyledLoadingButton
            disabled
            // disabled={isResolving || isLoading}
            // loading={isResolving || isLoading}
            // onClick={resolveURI}
            sx={{ minWidth: "32px" }}
          >
            <ArrowForwardOutlinedIcon />
          </StyledLoadingButton>
        </Paper>

        <Typography>Coming soon!</Typography>
        {/*
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
              <LoadingButton
                // disabled={}
                loading={isLoading}
                onClick={addFile}
              >
                Add
              </LoadingButton>
            </Stack>
          </>
        )} */}

        {isError && (
          <InlineErrorHandler message={error?.message + " Please try again."} />
        )}
      </Stack>
    </>
  );
};

export default DatasetFromOpenAlex;
