import * as React from "react";

import {
  Box,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  AutoAwesomeOutlined,
  DriveFolderUploadOutlined,
  FileUploadOutlined,
  LinkOutlined,
  SearchOutlined,
} from "@mui/icons-material";

import { ProjectAPI } from "api";
import { projectModes } from "globals.js";
import ImportProject from "ProjectComponents/ImportProject";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import {
  DatasetFromEntryPoint,
  DatasetFromFile,
  DatasetFromOpenAlex,
  DatasetFromURI,
} from "ProjectComponents/SetupComponents/DataUploadComponents";

import { useQuery } from "react-query";

// const DialogProjectName = ({ project_id, dataset_name }) => {
//   const [state, setState] = React.useState({
//     name: dataset_name,
//     edit: false,
//   });

//   const { isLoading: isMutatingName, mutate: mutateName } = useMutation(
//     ProjectAPI.mutateInfo,
//     {
//       mutationKey: ["mutateInfo"],
//       onSuccess: (data) => {
//         setState({
//           name: data?.name,
//           edit: false,
//         });
//       },
//     },
//   );

//   const toggleEditName = () => {
//     setState({
//       ...state,
//       edit: !state.edit,
//     });
//   };

//   return (
//     <DialogTitle>
//       Start project:{" "}
//       {!state.edit && (
//         <>
//           {state.name}
//           <Tooltip title={"Edit project name"}>
//             <IconButton onClick={toggleEditName}>
//               <Edit />
//             </IconButton>
//           </Tooltip>
//         </>
//       )}
//       {state.edit && (
//         <>
//           <Input
//             value={state.name}
//             onChange={(e) => {
//               setState({
//                 ...state,
//                 name: e.target.value,
//               });
//             }}
//             disabled={isMutatingName}
//             sx={{ width: "50%" }}
//             autoFocus
//           />
//           <Button
//             onClick={() => {
//               mutateName({ project_id: project_id, title: state.name });
//             }}
//             disabled={isMutatingName}
//             variant="contained"
//           >
//             Save
//           </Button>
//         </>
//       )}
//     </DialogTitle>
//   );
// };

const Upload = ({ mode }) => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [uploadSource, setUploadSource] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [setupProjectId, setSetupProjectId] = React.useState(null);

  useQuery(["fetchProjects", { subset: mode }], ProjectAPI.fetchProjects, {
    onSuccess: (data) => {
      if (data?.result.length === 0) {
        setUploadSource("file");
      }
    },
  });

  return (
    <>
      <Box sx={{ mb: 8 }}>
        <Tabs
          value={uploadSource}
          onChange={(event, newValue) => {
            setUploadSource(newValue);
          }}
          centered={!mobileScreen}
          textColor="secondary"
          indicatorColor="secondary"
          scrollButtons="auto"
          variant={mobileScreen ? "scrollable" : "standard"}
          aria-label="Upload source"
          sx={{ mb: 3 }}
        >
          <Tab
            value="file"
            label={
              <Box>
                <FileUploadOutlined sx={{ fontSize: 32 }} />
                <Typography>File</Typography>
              </Box>
            }
            sx={{ mx: 1 }}
          />
          <Tab
            value="url"
            label={
              <Box>
                <LinkOutlined sx={{ fontSize: 32 }} />
                <Typography>URL</Typography>
              </Box>
            }
            sx={{ mx: 1 }}
          />
          {mode === projectModes.ORACLE && (
            <Tab
              value="openalex"
              label={
                <Box>
                  <SearchOutlined sx={{ fontSize: 32 }} />
                  <Typography>OpenAlex</Typography>
                </Box>
              }
              sx={{ mx: 1 }}
            />
          )}
          <Tab
            value="benchmark"
            label={
              <Box>
                <AutoAwesomeOutlined sx={{ fontSize: 32 }} />
                <Typography>Discover</Typography>
              </Box>
            }
            sx={{ mx: 1 }}
          />
          <Tab
            value="import"
            label={
              <Box>
                <DriveFolderUploadOutlined sx={{ fontSize: 32 }} />
                <Typography>Import</Typography>
              </Box>
            }
            sx={{ mx: 1 }}
          />
        </Tabs>

        {uploadSource === "file" && (
          <DatasetFromFile mode={mode} setSetupProjectId={setSetupProjectId} />
        )}
        {uploadSource === "url" && (
          <DatasetFromURI mode={mode} setSetupProjectId={setSetupProjectId} />
        )}
        {mode === projectModes.ORACLE && uploadSource === "openalex" && (
          <DatasetFromOpenAlex
            mode={mode}
            setSetupProjectId={setSetupProjectId}
          />
        )}
        {uploadSource === "benchmark" && (
          <DatasetFromEntryPoint
            subset="benchmark"
            mode={mode}
            setSetupProjectId={setSetupProjectId}
          />
        )}
        {uploadSource === "import" && (
          <ImportProject mode={mode} setSetupProjectId={setSetupProjectId} />
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
