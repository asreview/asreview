import React from "react";
import { connect } from "react-redux";
import { InputBase, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation } from "react-query";

import LoadingButton from "@mui/lab/LoadingButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { InlineErrorHandler } from "../../../Components";
import { StyledLoadingButton } from "../../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../../api";
import { mapStateToProps } from "../../../globals";

const PREFIX = "DatasetFromURI";

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

const DatasetFromURI = ({ mode, setDataset }) => {
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
      setDataset(data);
    },
  });

  const handleURL = (event) => {
    setURI(event.target.value);
  };

  const resolveURI = (event) => {
    mutateResolve({ uri: localURI });
  };

  const validateURLOnEnter = (event) => {
    if (event.keyCode === 13) {
      resolveURI(event);
    }
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
            disabled={isResolving || isLoading}
            fullWidth
            id="url-dataset"
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
        </Paper>

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
            <Stack className={classes.root}>
              <LoadingButton
                // disabled={}
                loading={isLoading}
                onClick={addFile}
              >
                Add
              </LoadingButton>
            </Stack>
          </>
        )}

        {isError && (
          <InlineErrorHandler message={error?.message + " Please try again."} />
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps)(DatasetFromURI);
