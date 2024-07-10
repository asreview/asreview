import React from "react";
import { useState } from "react";
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
  Fade,
  Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Share } from "@mui/icons-material";

import { PageHeader } from "Components";
import {
  NumberCard,
  ShareFabAction,
  ProgressChart,
  ProgressDensityChart,
  ProgressRecallChart,
} from "ProjectComponents/AnalyticsComponents";
import { ProjectAPI } from "api";
import { projectModes } from "globals.js";
import { Switch, FormControlLabel } from "@mui/material";
import { Tooltip, IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { tooltipClasses } from "@mui/material";

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
  // State for Hide Prior Knowledge switch
  const [includePriorKnowledge, setIncludePriorKnowledge] = useState(false);

  // Queries for fetching data, including includePriorKnowledge state
  const progressQuery = useQuery(
    ["fetchProgress", { project_id, includePrior: includePriorKnowledge }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
        includePrior: includePriorKnowledge,
      }),
    { refetchOnWindowFocus: false },
  );
  const progressDensityQuery = useQuery(
    [
      "fetchProgressDensity",
      { project_id, includePrior: includePriorKnowledge },
    ],
    ({ queryKey }) =>
      ProjectAPI.fetchProgressDensity({
        queryKey,
        includePrior: includePriorKnowledge,
      }),
    { refetchOnWindowFocus: false },
  );
  const progressRecallQuery = useQuery(
    [
      "fetchProgressRecall",
      { project_id, includePrior: includePriorKnowledge },
    ],
    ({ queryKey }) =>
      ProjectAPI.fetchProgressRecall({
        queryKey,
        includePrior: includePriorKnowledge,
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

  // Handle toggling the switch
  const handleTogglePriorKnowledge = () => {
    setIncludePriorKnowledge((prev) => !prev);
  };

  // Custom styled tooltip for the switch
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      fontSize: theme.typography.pxToRem(12),
      padding: "10px",
    },
  }));

  return (
    <Root aria-label="analytics page">
      <Fade in>
        <Box>
          {props.mode !== projectModes.SIMULATION && (
            <Box
              className="main-page-sticky-header-wrapper"
              sx={{ background: (theme) => theme.palette.background.paper }}
            >
              <Box
                className="main-page-sticky-header with-button"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <PageHeader
                  header="Analytics"
                  mobileScreen={props.mobileScreen}
                />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!includePriorKnowledge}
                        onChange={handleTogglePriorKnowledge}
                      />
                    }
                    label="Hide Prior Knowledge"
                    labelPlacement="start"
                  />
                  <CustomTooltip
                    title={
                      <React.Fragment>
                        <br />
                        <br />
                        <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                          <li>
                            <strong>Hiding</strong> prior knowledge will only
                            show labelings done using ASReview.
                          </li>
                          <br />
                          <li>
                            <strong>Showing</strong> prior knowledge will show
                            combined labelings from the original dataset and
                            those done using ASReview.
                          </li>
                        </ul>
                      </React.Fragment>
                    }
                    arrow
                  >
                    <IconButton size="small" sx={{ marginRight: 1 }}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </CustomTooltip>
                </Box>
              </Box>
            </Box>
          )}
          {props.mode === projectModes.SIMULATION && (
            <Box
              className="main-page-sticky-header-wrapper"
              sx={{ background: (theme) => theme.palette.background.paper }}
            >
              <Box
                className="main-page-sticky-header with-button"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <PageHeader
                  header="Analytics"
                  mobileScreen={props.mobileScreen}
                />
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!includePriorKnowledge}
                        onChange={handleTogglePriorKnowledge}
                      />
                    }
                    label="Hide Prior Knowledge"
                    labelPlacement="start"
                  />
                  <CustomTooltip
                    title={
                      <React.Fragment>
                        Toggle to include or hide prior knowledge from the
                        statistics.
                        <br />
                        <br />
                        <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                          <li>
                            <strong>Hiding</strong> prior knowledge will only
                            show labelings done using ASReview.
                          </li>
                          <br />
                          <li>
                            <strong>Showing</strong> prior knowledge will show
                            combined labelings from the original dataset and
                            those done using ASReview.
                          </li>
                        </ul>
                      </React.Fragment>
                    }
                    arrow
                  >
                    <IconButton size="small" sx={{ marginRight: 1 }}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </CustomTooltip>
                </Box>
              </Box>
            </Box>
          )}
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
                      includePriorKnowledge={includePriorKnowledge} // Pass the state as prop
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <NumberCard
                      mobileScreen={props.mobileScreen}
                      progressQuery={progressQuery}
                      includePriorKnowledge={includePriorKnowledge} // Pass the state as prop
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
        </Box>
      </Fade>
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
