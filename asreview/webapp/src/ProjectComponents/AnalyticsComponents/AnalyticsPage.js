import { Share } from "@mui/icons-material";
import {
  Box,
  Fade,
  Container,
  Grid2 as Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Divider,
  Tab,
  Tabs,
  Typography,
  AvatarGroup,
  Avatar,
  Skeleton,
} from "@mui/material";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import {
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
  WeiboIcon,
  WhatsappIcon,
} from "react-share";

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

const actions = [
  { icon: <TwitterIcon round />, name: "Twitter" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];

const AnalyticsPage = () => {
  const { project_id } = useParams();

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
  const twitterRef = React.useRef(null);
  const facebookRef = React.useRef(null);
  const weiboRef = React.useRef(null);
  const whatsappRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const handleShare = (platform) => {
    if (platform === "Twitter") {
      twitterRef.current?.click();
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
  const [activeChartTab, setActiveChartTab] = useState(0);
  const [activeProgressTab, setActiveProgressTab] = useState(0);

  return (
    <Container maxWidth="md" aria-label="analytics page" sx={{ mb: 3 }}>
      <Stack spacing={2} className="main-page-body">
        <Fade in>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: "Roboto Serif", textAlign: "center", pb: 2 }}
            >
              {data?.name}
            </Typography>
            <Typography
              sx={{ fontFamily: "Roboto Serif", textAlign: "center", pb: 6 }}
            >
              747 records in total
            </Typography>
          </Box>
        </Fade>
        <Box>
          <AvatarGroup max={20}>
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
            <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
            <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
            <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
          </AvatarGroup>
        </Box>
        <Grid container columns={2}>
          <Grid size={1}>
            <ReviewProgress project_id={project_id} />
          </Grid>

          <Grid size={1}>
            <StoppingSuggestion project_id={project_id} />
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
          >
            <Tab label="Labeling History" />
            <Tab label="Labeling Frequency" />
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
            <LabelingFrequency
              genericDataQuery={genericDataQuery}
              progressQuery={progressQuery}
            />
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

        <WordCounts />
      </Stack>
      <SpeedDial
        ariaLabel="share project analytics"
        icon={<Share />}
        sx={{
          position: "absolute",
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
        twitterRef={twitterRef}
        facebookRef={facebookRef}
        weiboRef={weiboRef}
        whatsappRef={whatsappRef}
        emailRef={emailRef}
      />
    </Container>
  );
};
export default AnalyticsPage;
