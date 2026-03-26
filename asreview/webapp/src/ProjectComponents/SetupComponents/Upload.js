import * as React from "react";

import {
  Box,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import {
  CategoryOutlined,
  CelebrationOutlined,
  Close,
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
  const theme = useTheme();
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const [uploadSource, setUploadSource] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(null);
  const [setupProjectId, setSetupProjectId] = React.useState(null);
  const [showNewFeatureBanner, setShowNewFeatureBanner] = React.useState(true);

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

        {showNewFeatureBanner &&
          (uploadSource === "file" || uploadSource === "url") && (
            <Box
              sx={{
                display: "flex",
                alignItems: "stretch",
                gap: 2,
                background: isDark
                  ? `linear-gradient(135deg, #2a1f1e, #2a2718, #1e2a1c, #1c272a, #231e2a) padding-box,
                     linear-gradient(135deg, #a35247, #a38135, #5e7c48, #2e7a87, #6b4e8e) border-box`
                  : `linear-gradient(135deg, #fff0ee, #fffbe8, #f0faed, #e8f7fb, #f5eeff) padding-box,
                     linear-gradient(135deg, #f97b6b, #f9c74f, #90be6d, #43b3c8, #9b72cf) border-box`,
                border: "2px solid transparent",
                borderRadius: 2,
                px: 3,
                py: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <CelebrationOutlined
                  sx={{ color: isDark ? "#a38135" : "#f9c74f", fontSize: 40 }}
                />
              </Box>
              <Box>
                <Typography fontWeight="bold" fontSize="0.9rem">
                  New feature
                </Typography>
                <Typography fontSize="0.875rem">
                  We automatically spot and hide records with identical titles
                  and texts to keep your screening clean and tidy. Need those
                  records back? No problem—during export you can decide to
                  include or hide them.
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setShowNewFeatureBanner(false)}
                sx={{ ml: "auto", flexShrink: 0 }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
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
