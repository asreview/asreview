import * as React from "react";

import {
  Box,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";

import {
  PeopleOutlined,
  FolderOutlined,
  QueueOutlined,
} from "@mui/icons-material";

import {
  UsersComponent,
  ProjectsComponent,
  TrainingQueueComponent,
} from "AdminComponents";

const AdminPageHeader = () => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 2, pt: 4, m: 1 }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: "Roboto Serif",
          mb: 2,
        }}
      >
        Admin Dashboard
      </Typography>
    </Stack>
  );
};

const Overview = ({ mobileScreen }) => {
  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = React.useState("users");

  const clickTab = (value) => setActiveTab(value);

  return (
    <>
      <AdminPageHeader />
      <Container maxWidth="md">
        {/* Admin Navigation Tabs */}
        <Box sx={{ mb: 8 }}>
          {smallScreen ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                mb: 3,
              }}
            >
              <Tab
                value="users"
                label={
                  <Box>
                    <PeopleOutlined sx={{ fontSize: 32 }} />
                    <Typography>Users</Typography>
                  </Box>
                }
                onClick={() => clickTab("users")}
                sx={{ width: "100%" }}
              />
              <Tab
                value="projects"
                label={
                  <Box>
                    <FolderOutlined sx={{ fontSize: 32 }} />
                    <Typography>Projects</Typography>
                  </Box>
                }
                onClick={() => clickTab("projects")}
                sx={{ width: "100%" }}
              />
              <Tab
                value="trainingqueue"
                label={
                  <Box>
                    <QueueOutlined sx={{ fontSize: 32 }} />
                    <Typography>Training Queue</Typography>
                  </Box>
                }
                onClick={() => clickTab("trainingqueue")}
                sx={{ width: "100%" }}
              />
            </Box>
          ) : (
            <Tabs
              value={activeTab}
              centered={!smallScreen}
              textColor="secondary"
              indicatorColor="secondary"
              scrollButtons="auto"
              variant={smallScreen ? "scrollable" : "standard"}
              aria-label="Admin sections"
              sx={{ mb: 3 }}
            >
              <Tab
                value="users"
                label={
                  <Box>
                    <PeopleOutlined sx={{ fontSize: 32 }} />
                    <Typography>Users</Typography>
                  </Box>
                }
                onClick={() => clickTab("users")}
                sx={{ mx: 1 }}
              />
              <Tab
                value="projects"
                label={
                  <Box>
                    <FolderOutlined sx={{ fontSize: 32 }} />
                    <Typography>Projects</Typography>
                  </Box>
                }
                onClick={() => clickTab("projects")}
                sx={{ mx: 1 }}
              />
              <Tab
                value="trainingqueue"
                label={
                  <Box>
                    <QueueOutlined sx={{ fontSize: 32 }} />
                    <Typography>Training Queue</Typography>
                  </Box>
                }
                onClick={() => clickTab("trainingqueue")}
                sx={{ mx: 1 }}
              />
            </Tabs>
          )}

          {/* Tab Content */}
          {activeTab === "users" && <UsersComponent />}

          {activeTab === "projects" && <ProjectsComponent />}

          {activeTab === "trainingqueue" && <TrainingQueueComponent />}
        </Box>
      </Container>
    </>
  );
};

export default Overview;
