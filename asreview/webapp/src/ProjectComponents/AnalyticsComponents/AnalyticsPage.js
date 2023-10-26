import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import {
  EmailIcon,
  TwitterIcon,
  FacebookIcon,
  WeiboIcon,
  WhatsappIcon,
} from "react-share";
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Share } from "@mui/icons-material";

import { PageHeader } from "../../Components";
import {
  NumberCard,
  ShareFabAction,
  ProgressChart,
  ProgressDensityChart,
  ProgressRecallChart,
} from "../AnalyticsComponents";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography.js";

import { ProjectAPI } from "../../api/index.js";
import { projectModes } from "../../globals.js";

const Root = styled("div")(({ theme }) => ({}));

const actions = [
  { icon: <TwitterIcon round />, name: "Twitter" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];

const AnalyticsPage = (props) => {
  const { project_id } = useParams();

  const progressQuery = useQuery(
    ["fetchProgress", { project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false },
  );
  const progressDensityQuery = useQuery(
    ["fetchProgressDensity", { project_id }],
    ProjectAPI.fetchProgressDensity,
    { refetchOnWindowFocus: false },
  );
  const progressRecallQuery = useQuery(
    ["fetchProgressRecall", { project_id }],
    ProjectAPI.fetchProgressRecall,
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

  const allQueriesReady = () => {
    return (
      !progressQuery.isFetching &&
      !progressDensityQuery.isFetching &&
      !progressRecallQuery.isFetching
    );
  };

  return (
    <Root aria-label="analytics page">
      <Fade in>
        <Box>
          {props.mode !== projectModes.SIMULATION && (
            <PageHeader header="Analytics" mobileScreen={props.mobileScreen} />
          )}
          {props.mode === projectModes.SIMULATION && (
            <Box
              className="main-page-sticky-header-wrapper"
              sx={{ background: (theme) => theme.palette.background.paper }}
            >
              <Box className="main-page-sticky-header with-button">
                {!props.mobileScreen && (
                  <TypographyH5Medium>Analytics</TypographyH5Medium>
                )}
                {props.mobileScreen && (
                  <Typography variant="h6">Analytics</Typography>
                )}
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={!allQueriesReady() || !props.isSimulating}
                    variant="contained"
                    onClick={props.refetchAnalytics}
                    size={!props.mobileScreen ? "medium" : "small"}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
          {!allQueriesReady() && (
            <Box className="main-page-body-wrapper">
              <CircularProgress />
            </Box>
          )}
          {allQueriesReady() && (
            <Box className="main-page-body-wrapper">
              <Stack spacing={3} className="main-page-body">
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={5}>
                      <ProgressChart
                        isSimulating={props.isSimulating}
                        mobileScreen={props.mobileScreen}
                        mode={props.mode}
                        progressQuery={progressQuery}
                      />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <NumberCard
                        mobileScreen={props.mobileScreen}
                        progressQuery={progressQuery}
                      />
                    </Grid>
                  </Grid>
                </Box>
                <ProgressDensityChart
                  mobileScreen={props.mobileScreen}
                  progressDensityQuery={progressDensityQuery}
                />
                <ProgressRecallChart
                  mobileScreen={props.mobileScreen}
                  progressRecallQuery={progressRecallQuery}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Fade>
      {allQueriesReady() && (
        <SpeedDial
          ariaLabel="share project analytics"
          className="main-page-fab"
          icon={<Share />}
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
      )}
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
