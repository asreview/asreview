import { Share } from "@mui/icons-material";
import {
  Box,
  Grid2 as Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
} from "ProjectComponents/AnalyticsComponents";
import { ProjectAPI } from "api";

const Root = styled("div")(({ theme }) => ({}));
const actions = [
  { icon: <TwitterIcon round />, name: "Twitter" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];
const AnalyticsPage = () => {
  const { project_id } = useParams();
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
    <Root aria-label="analytics page">
      <Box className="main-page-body-wrapper">
        <Stack spacing={2} className="main-page-body">
          <Box>
            <Tabs
              value={activeProgressTab}
              onChange={(event, newValue) => setActiveProgressTab(newValue)}
            >
              <Tab label="Review Progress" />
              <Tab label="Stopping Suggestion" />
            </Tabs>
            {activeProgressTab === 0 && (
              <ReviewProgress progressQuery={progressQuery} />
            )}
            {activeProgressTab === 1 && (
              <StoppingSuggestion progressQuery={progressQuery} />
            )}
          </Box>
          <Grid item size={12}>
            <Box sx={{ position: "relative" }}>
              <Box>
                <Tabs
                  value={activeHistoryTab}
                  onChange={(event, newValue) => setActiveHistoryTab(newValue)}
                  left
                >
                  <Tab label="Labeling History" />
                  <Tab label="Labeling Frequency" />
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
              </Box>
            </Box>
          </Grid>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Tabs
                value={activeChartTab}
                onChange={(event, newValue) => setActiveChartTab(newValue)}
                left
              >
                <Tab label="Density" />
                <Tab label="Recall" />
              </Tabs>
              {activeChartTab === 0 && (
                <ProgressDensityChart
                  genericDataQuery={genericDataQuery}
                  sx={{
                    height: "400px",
                    width: "100%",
                  }}
                />
              )}
              {activeChartTab === 1 && (
                <ProgressRecallChart
                  genericDataQuery={genericDataQuery}
                  sx={{
                    height: "400px",
                    width: "100%",
                  }}
                />
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
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
    </Root>
  );
};
export default AnalyticsPage;
