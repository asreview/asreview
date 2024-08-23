import React from "react";
import { useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Share, SwapHoriz } from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { tooltipClasses } from "@mui/material";

import { PageHeader } from "Components";
import {
  NumberCard,
  ShareFabAction,
  ProgressDensityChart,
  ProgressRecallChart,
  HistoryBar,
  AlternativeHistoryBar,
} from "ProjectComponents/AnalyticsComponents";
import { ProjectAPI } from "api";
import { projectModes } from "globals.js";

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
  const [showAlternativeHistory, setShowAlternativeHistory] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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

  const labelingChronologyQuery = useQuery(
    [
      "fetchLabelingChronology",
      { project_id, includePrior: includePriorKnowledge },
    ],
    ({ queryKey }) =>
      ProjectAPI.fetchLabelingChronology({
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


  // Reviewed paper threshold for showing the switch button
  const HistoryBarSwitchShowThreshold = 10;
  
  const handleToggleHistoryBar = () => {
    setShowAlternativeHistory((prev) => !prev);
  };

  const totalLabeledRecords =
    (progressQuery.data?.n_included || 0) + (progressQuery.data?.n_excluded || 0);

  const showSwitchButton = totalLabeledRecords > HistoryBarSwitchShowThreshold;
  const shouldShowAlternativeHistory = totalLabeledRecords > HistoryBarSwitchShowThreshold && showAlternativeHistory;

  useEffect(() => {
    // Check if the user has already been notified
    const hasNotified = sessionStorage.getItem("hasNotified");

    if (!hasNotified && totalLabeledRecords > HistoryBarSwitchShowThreshold) {
      setShowNotification(true);
      sessionStorage.setItem("hasNotified", "true"); // Set the flag in session storage
    }
  }, [totalLabeledRecords]);

  return (
    <Root aria-label="analytics page">
      <Fade in>
        <Box>
          {props.mode !== projectModes.SIMULATION && (
            <Box className="main-page-sticky-header-wrapper" sx={{ background: (theme) => theme.palette.background.paper }}>
              <Card sx={{  borderBottomLeftRadius: 60, borderBottomRightRadius: 60,padding: 2, boxShadow: 0, mb: 0, ml:10, mr:10 }}>
                <Box className="main-page-sticky-header with-button" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <PageHeader 
                  header= <b>Analytics</b> 
                  mobileScreen={props.mobileScreen}
                  
                  />
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {showSwitchButton && (
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
                    )}
                    {showSwitchButton && (
                      <CustomTooltip
                        title={
                          <React.Fragment>
                            <br />
                            <br />
                            <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                              <li>
                                <strong>Hiding</strong> prior knowledge will only show labelings done using ASReview.
                              </li>
                              <br />
                              <li>
                                <strong>Showing</strong> prior knowledge will show combined labelings from the original dataset and those done using ASReview.
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
                    )}
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
          {props.mode === projectModes.SIMULATION && (
            <Box className="main-page-sticky-header-wrapper" sx={{ background: (theme) => theme.palette.background.paper }}>
              <Card sx={{ borderRadius: 4, padding: 1.5, boxShadow: 1, mb: 2 }}>
                <Box className="main-page-sticky-header with-button" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <PageHeader header=  <b>Analytics</b> mobileScreen={props.mobileScreen} />
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {showSwitchButton && (
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
                    )}
                    {showSwitchButton && (
                      <CustomTooltip
                        title={
                          <React.Fragment>
                            Toggle to include or hide prior knowledge from the statistics.
                            <br />
                            <br />
                            <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                              <li>
                                <strong>Hiding</strong> prior knowledge will only show labelings done using ASReview.
                              </li>
                              <br />
                              <li>
                                <strong>Showing</strong> prior knowledge will show combined labelings from the original dataset and those done using ASReview.
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
                    )}
                  </Box>
                </Box>
              </Card>
            </Box>
          )}
          <Box className="main-page-body-wrapper">
            <Stack spacing={3} className="main-page-body">
              <Box>
                <NumberCard
                  mobileScreen={props.mobileScreen}
                  progressQuery={progressQuery}
                  includePriorKnowledge={includePriorKnowledge} // Pass the state as prop
                />
              </Box>
  
              <Grid item xs={12}>
                <Box sx={{ position: "relative" }}>
                  <Box sx={{ position: "absolute", top: 0, left: 0, padding: 1, zIndex: 1, display: "flex", alignItems: "center" }}>
                    {showSwitchButton && (
                      <IconButton
                        size="small"
                        onClick={handleToggleHistoryBar}
                        sx={{
                          position: "relative",
                          marginRight: 1,
                          border: "0px solid",
                          borderColor: "#28282B",
                          borderRadius: "50%",
                          boxShadow: 0,
                          color: "#fff",
                        }}
                      >
                        <SwapHoriz />
                      </IconButton>
                    )}
                  </Box>
                  {shouldShowAlternativeHistory ? (
                    <AlternativeHistoryBar
                      mobileScreen={props.mobileScreen}
                      labelingChronologyQuery={labelingChronologyQuery}
                      progressQuery={progressQuery}
                    />
                  ) : (
                    <HistoryBar
                      mobileScreen={props.mobileScreen}
                      labelingChronologyQuery={labelingChronologyQuery}
                      progressQuery={progressQuery}
                    />
                  )}
                </Box>
              </Grid>
  
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: 4, padding: 0.5, boxShadow: 1 }}>
                      <CardContent>
                        <ProgressDensityChart
                          mobileScreen={props.mobileScreen}
                          progressDensityQuery={progressDensityQuery}
                          sx={{ height: "400px", width: "100%" }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ borderRadius: 4, padding: 0.5, boxShadow: 1 }}>
                      <CardContent>
                        <ProgressRecallChart
                          mobileScreen={props.mobileScreen}
                          progressRecallQuery={progressRecallQuery}
                          sx={{ height: "400px", width: "100%" }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
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
      {showNotification && (
        <Snackbar
          open={showNotification}
          autoHideDuration={6000}
          onClose={() => setShowNotification(false)}
        >
          <Alert onClose={() => setShowNotification(false)} severity="info">
            You have labeled {HistoryBarSwitchShowThreshold} records. You can use the advanced Labeling History from now!
          </Alert>
        </Snackbar>
      )}
    </Root>
  );
};
export default AnalyticsPage;
