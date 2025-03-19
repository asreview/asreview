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
  CategoryOutlined,
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
  DatasetFromSearch,
  DatasetFromURI,
} from "ProjectComponents/SetupComponents/DataUploadComponents";

import { useQuery } from "react-query";

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

  const clickTab = (value) =>
    setUploadSource(value === uploadSource ? false : value);

  return (
    <>
      <Box sx={{ mb: 8 }}>
        {mobileScreen ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              mb: 3,
            }}
          >
            <Tab
              value="file"
              label={
                <Box>
                  <FileUploadOutlined sx={{ fontSize: 32 }} />
                  <Typography>File</Typography>
                </Box>
              }
              onClick={() => clickTab("file")}
              sx={{ width: "100%" }}
            />
            <Tab
              value="url"
              label={
                <Box>
                  <LinkOutlined sx={{ fontSize: 32 }} />
                  <Typography>URL</Typography>
                </Box>
              }
              sx={{ width: "100%" }}
              onClick={() => clickTab("url")}
            />
            {mode === projectModes.ORACLE ? (
              <Tab
                value="search"
                label={
                  <Box>
                    <SearchOutlined sx={{ fontSize: 32 }} />
                    <Typography>Search</Typography>
                  </Box>
                }
                onClick={() => clickTab("search")}
                sx={{ width: "100%" }}
              />
            ) : (
              <Tab
                value="discover"
                label={
                  <Box>
                    <CategoryOutlined sx={{ fontSize: 32 }} />
                    <Typography>Discover</Typography>
                  </Box>
                }
                onClick={() => clickTab("discover")}
                sx={{ width: "100%" }}
              />
            )}

            <Box
              sx={{
                gridColumn: "1/4",
                display: "flex",
                justifyContent: "center",
                mt: 1,
              }}
            >
              {mode === projectModes.ORACLE && (
                <Tab
                  value="discover"
                  label={
                    <Box>
                      <CategoryOutlined sx={{ fontSize: 32 }} />
                      <Typography>Discover</Typography>
                    </Box>
                  }
                  onClick={() => clickTab("discover")}
                  sx={{ width: "auto", mx: 2 }}
                />
              )}
              <Tab
                value="import"
                label={
                  <Box>
                    <DriveFolderUploadOutlined sx={{ fontSize: 32 }} />
                    <Typography>Import</Typography>
                  </Box>
                }
                onClick={() => clickTab("import")}
                sx={{ width: "auto", mx: 2 }}
              />
            </Box>
          </Box>
        ) : (
          <Tabs
            value={uploadSource}
            // onChange={(event, newValue) => {
            //   setUploadSource(newValue);
            // }}
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
              onClick={() => clickTab("file")}
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
              onClick={() => clickTab("url")}
            />
            {mode === projectModes.ORACLE && (
              <Tab
                value="search"
                label={
                  <Box>
                    <SearchOutlined sx={{ fontSize: 32 }} />
                    <Typography>Search</Typography>
                  </Box>
                }
                onClick={() => clickTab("search")}
                sx={{ mx: 1 }}
              />
            )}
            <Tab
              value="discover"
              label={
                <Box>
                  <CategoryOutlined sx={{ fontSize: 32 }} />
                  <Typography>Discover</Typography>
                </Box>
              }
              onClick={() => clickTab("discover")}
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
              onClick={() => clickTab("import")}
              sx={{ mx: 1 }}
            />
          </Tabs>
        )}

        {uploadSource === "file" && (
          <DatasetFromFile mode={mode} setSetupProjectId={setSetupProjectId} />
        )}
        {uploadSource === "url" && (
          <DatasetFromURI mode={mode} setSetupProjectId={setSetupProjectId} />
        )}
        {mode === projectModes.ORACLE && uploadSource === "search" && (
          <DatasetFromSearch
            mode={mode}
            setSetupProjectId={setSetupProjectId}
          />
        )}
        {uploadSource === "discover" && (
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
        onClose={() => {
          setSetupProjectId(null);
          setUploadSource(false);
        }}
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
