import Edit from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  DialogTitle,
  IconButton,
  Input,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";

import { useMutation } from "react-query";

import useMediaQuery from "@mui/material/useMediaQuery";

import {
  AutoAwesomeOutlined,
  FileUploadOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import {
  DatasetFromEntryPoint,
  DatasetFromFile,
  DatasetFromOpenAlex,
  DatasetFromURI,
} from "ProjectComponents/SetupComponents/DataUploadComponents";
import { ProjectAPI } from "api";
import { SetupDialog } from "ProjectComponents/SetupComponents";

const DialogProjectName = ({ project_id, dataset_name }) => {
  const [state, setState] = React.useState({
    name: dataset_name,
    edit: false,
  });

  const { isLoading: isMutatingName, mutate: mutateName } = useMutation(
    ProjectAPI.mutateInfo,
    {
      mutationKey: ["mutateInfo"],
      onSuccess: (data) => {
        setState({
          name: data?.name,
          edit: false,
        });
      },
    },
  );

  const toggleEditName = () => {
    setState({
      ...state,
      edit: !state.edit,
    });
  };

  return (
    <DialogTitle>
      Start project:{" "}
      {!state.edit && (
        <>
          {state.name}
          <Tooltip title={"Edit project name"}>
            <IconButton onClick={toggleEditName}>
              <Edit />
            </IconButton>
          </Tooltip>
        </>
      )}
      {state.edit && (
        <>
          <Input
            value={state.name}
            onChange={(e) => {
              setState({
                ...state,
                name: e.target.value,
              });
            }}
            disabled={isMutatingName}
            sx={{ width: "50%" }}
            autoFocus
          />
          <Button
            onClick={() => {
              mutateName({ project_id: project_id, title: state.name });
            }}
            disabled={isMutatingName}
            variant="contained"
          >
            Save
          </Button>
        </>
      )}
    </DialogTitle>
  );
};

const Upload = ({ mode }) => {
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // state management
  const [uploadSource, setUploadSource] = React.useState("file");
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [setupProjectId, setSetupProjectId] = React.useState(null);

  return (
    <>
      <Box sx={{ mb: 8 }}>
        <Tabs
          value={uploadSource}
          onChange={(event, newValue) => {
            setUploadSource(newValue);
          }}
          centered
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="Upload source"
          sx={{ mb: 4 }}
        >
          <Tab
            value="file"
            label={
              <Box>
                <FileUploadOutlined sx={{ fontSize: 40 }} />
                <Typography>File</Typography>
              </Box>
            }
            sx={{ mx: 2 }}
          />
          <Tab
            value="url"
            label={
              <Box>
                <LinkOutlined sx={{ fontSize: 40 }} />
                <Typography>URL</Typography>
              </Box>
            }
            sx={{ mx: 2 }}
          />
          <Tab
            value="openalex"
            label={
              <Box>
                <SearchOutlined sx={{ fontSize: 40 }} />
                <Typography>OpenAlex</Typography>
              </Box>
            }
            sx={{ mx: 2 }}
          />
          <Tab
            value="benchmark"
            label={
              <Box>
                <AutoAwesomeOutlined sx={{ fontSize: 40 }} />
                <Typography>Discover</Typography>
              </Box>
            }
            sx={{ mx: 2 }}
          />
          <Tab
            value="test"
            label={
              <Box>
                <AutoAwesomeOutlined sx={{ fontSize: 40 }} />
                <Typography>test</Typography>
              </Box>
            }
            sx={{ mx: 2 }}
          />
        </Tabs>

        {uploadSource === "file" && (
          <DatasetFromFile mode={mode} setSetupProjectId={setSetupProjectId} />
        )}
        {uploadSource === "url" && (
          <DatasetFromURI mode={mode} setDataset={(dataset) => {}} />
        )}
        {uploadSource === "openalex" && (
          <DatasetFromOpenAlex mode={mode} setDataset={(dataset) => {}} />
        )}
        {uploadSource === "benchmark" && (
          <DatasetFromEntryPoint
            subset="benchmark"
            mode={mode}
            setDataset={(dataset) => {}}
            mobileScreen={fullScreen}
          />
        )}
      </Box>

      <SetupDialog
        project_id={setupProjectId}
        mode={mode}
        open={setupProjectId !== null}
        onClose={() => setSetupProjectId(null)}
      />

      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={snackbarMessage !== null}
        autoHideDuration={5000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </>
  );
};

export default Upload;
