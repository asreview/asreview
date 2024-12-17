import { Share } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
// import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import {
  EmailIcon,
  FacebookIcon,
  WeiboIcon,
  WhatsappIcon,
  XIcon,
} from "react-share";

import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
// import AddIcon from "@mui/icons-material/Add";
import { IconButton, TextField } from "@mui/material";

import {
  LabelingFrequency,
  LabelingHistory,
  ProgressDensityChart,
  ProgressRecallChart,
  ReviewProgress,
  ShareFabAction,
  StoppingSuggestion,
  WordCounts,
} from "ProjectComponents/AnalyticsComponents";
import { ProjectAPI } from "api";

// import ElasFireman from "../../images/ElasFireMan.jpg";
// import ElasGrad from "../../images/ElasGrad.jpg";
// import ElasSuperHero from "../../images/ElasSuperHero.jpg";

const actions = [
  { icon: <XIcon round />, name: "X" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];

const AnalyticsPage = () => {
  const { project_id } = useParams();

  // Relevant to name editing. Currently goes to local storage, we can do this the proper way

  const { data } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  const progressQuery = useQuery(
    ["fetchProgress", { project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );
  // New unified query for fetching data
  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchGenericData({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );
  const xRef = React.useRef(null);
  const facebookRef = React.useRef(null);
  const weiboRef = React.useRef(null);
  const whatsappRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const handleShare = (platform) => {
    if (platform === "X") {
      xRef.current?.click();
    }
    if (platform === "Facebook") {
      facebookRef.current?.click();
    }
    if (platform === "Weibo") {
      weiboRef.current?.click();
    }
    if (platform === "WhatsApp") {
      whatsappRef.current?.click();
    }
    if (platform === "Email") {
      emailRef.current?.click();
    }
  };
  const [activeHistoryTab, setActiveHistoryTab] = useState(0);
  // const [activeProgressTab, setActiveProgressTab] = useState(0);
  const [activeStoppingTab, setActiveStoppingTab] = useState(0);
  const [activeInsightsTab, setActiveInsightsTab] = useState(0);

  // Name editing. Currently goes to local storage, we can do this the proper way

  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState(
    () => localStorage.getItem(`projectName-${project_id}`) || data?.name || "",
  );

  useEffect(() => {
    if (data?.name && !localStorage.getItem(`projectName-${project_id}`)) {
      setCustomName(data.name);
      localStorage.setItem(`projectName-${project_id}`, data.name);
    }
  }, [data, project_id]);

  const handleNameChange = (event) => {
    setCustomName(event.target.value);
  };

  const toggleEditing = () => {
    if (isEditing) {
      localStorage.setItem(`projectName-${project_id}`, customName);
    }
    setIsEditing(!isEditing);
  };

  // Users for the avatar group

  // const users = [
  //   { name: "Jonathan", avatar: ElasFireman },
  //   { name: "Rens", avatar: ElasGrad },
  //   { name: "Berke", avatar: ElasSuperHero },
  // ];

  // // Mock handler for adding a new user, this can redirect to the 'Team' tab
  // const handleAddUser = () => {
  //   console.log("Add user clicked");
  // };

  return (
    <Container maxWidth="md" aria-label="analytics page" sx={{ mb: 3 }}>
      <Stack spacing={2} className="main-page-body">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: "Roboto Serif", textAlign: "center", pb: 2 }}
          >
            {isEditing ? (
              <TextField
                value={customName}
                onChange={handleNameChange}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={toggleEditing} edge="end">
                      <CheckIcon />
                    </IconButton>
                  ),
                }}
              />
            ) : (
              <>
                {customName}
                <IconButton onClick={toggleEditing} sx={{ ml: 1 }}>
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Typography>
          <Typography
            sx={{ fontFamily: "Roboto Serif", textAlign: "center", pb: 6 }} // when the avatars are visible, should be pb: 3
          >
            {progressQuery.data && progressQuery.data.n_records} records in
            total
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pb: 3,
          }}
        >
          {/* <AvatarGroup max={20}>
            {users.map((user, index) => (
              <Tooltip key={index} title={user.name} arrow>
                <Avatar alt={user.name} src={user.avatar} />
              </Tooltip>
            ))}
          </AvatarGroup>
          <Avatar
            sx={{
              bgcolor: "grey.400",
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
            onClick={handleAddUser}
          >
            <AddIcon />
          </Avatar> */}
        </Box>
        <Grid container columns={{ xs: 1, md: 2 }}>
          <Grid size={1}>
            <Tabs
              value={activeHistoryTab}
              onChange={(event, newValue) => setActiveHistoryTab(newValue)}
              scrollButtons="auto"
              variant="scrollable"
            >
              <Tab label="Progress" />
            </Tabs>
            <ReviewProgress project_id={project_id} />
          </Grid>
          <Grid size={1}>
            <Tabs
              value={activeStoppingTab}
              onChange={(event, newValue) => setActiveStoppingTab(newValue)}
            >
              <Tab label="Stopping" />
            </Tabs>
            {activeStoppingTab === 0 && (
              <StoppingSuggestion project_id={project_id} />
            )}
          </Grid>
        </Grid>

        <Divider
          sx={{
            pt: 6,
            pb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
            Review progress
          </Typography>
        </Divider>

        <Box>
          <Tabs
            value={activeHistoryTab}
            onChange={(event, newValue) => setActiveHistoryTab(newValue)}
            scrollButtons="auto"
            variant="scrollable"
          >
            <Tab label="History" />
            <Tab label="Frequency" />
            <Tab label="Density" />
            <Tab label="Recall" />
          </Tabs>
          {activeHistoryTab === 0 && (
            <LabelingHistory
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
          )}
          {activeHistoryTab === 1 && (
            <LabelingFrequency project_id={project_id} />
          )}
          {activeHistoryTab === 2 && (
            <ProgressDensityChart genericDataQuery={genericDataQuery} />
          )}
          {activeHistoryTab === 3 && (
            <ProgressRecallChart genericDataQuery={genericDataQuery} />
          )}
        </Box>

        <Divider
          sx={{
            pt: 6,
            pb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
            Insights in AI
          </Typography>
        </Divider>
        <Grid size={1}>
          <Tabs
            value={activeInsightsTab}
            onChange={(event, newValue) => setActiveInsightsTab(newValue)}
          >
            <Tab label="Words of Importance" />
            {/* <Tab label="Feature Importance" />
            <Tab label="Doc2Vec" />
            <Tab label="BERT" />
            <Tab label="Random Forest" /> */}
          </Tabs>
          {activeInsightsTab === 0 && <WordCounts project_id={project_id} />}
          {/* {activeInsightsTab === 1 && (
            <FeatureImportanceOneWord
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
          )}
          {activeInsightsTab === 2 && (
            <Doc2VecVisualization
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
          )}
          {activeInsightsTab === 3 && (
            <NeuralNetworkVisualization
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
          )}
          {activeInsightsTab === 4 && (
            <RandomForestVisualization
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
          )} */}
        </Grid>
      </Stack>
      <SpeedDial
        ariaLabel="share project analytics"
        icon={<Share />}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              handleShare(action.name);
            }}
          />
        ))}
      </SpeedDial>
      <ShareFabAction
        progressQueryData={progressQuery.data}
        xRef={xRef}
        facebookRef={facebookRef}
        weiboRef={weiboRef}
        whatsappRef={whatsappRef}
        emailRef={emailRef}
      />
    </Container>
  );
};
export default AnalyticsPage;
