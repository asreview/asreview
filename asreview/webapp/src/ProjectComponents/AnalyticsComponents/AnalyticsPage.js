import React from "react";
import { useQuery } from "react-query";
import {
  EmailIcon,
  TwitterIcon,
  FacebookIcon,
  WeiboIcon,
  WhatsappIcon,
} from "react-share";
import { Box, Grid, SpeedDial, SpeedDialAction } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Share } from "@mui/icons-material";

import {
  NumberCard,
  ShareFabAction,
  ProgressChart,
  ProgressDensityChart,
  ProgressRecallChart,
} from "../AnalyticsComponents";

import { ProjectAPI } from "../../api/index.js";

const PREFIX = "AnalyticsPage";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    "& > *": {
      margin: theme.spacing(2),
    },
  },
}));

const actions = [
  { icon: <TwitterIcon round />, name: "Twitter" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];

export default function AnalyticsPage(props) {
  const progressQuery = useQuery(
    ["fetchProgress", { project_id: props.project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false }
  );
  const progressDensityQuery = useQuery(
    ["fetchProgressDensity", { project_id: props.project_id }],
    ProjectAPI.fetchProgressDensity,
    { refetchOnWindowFocus: false }
  );
  const progressRecallQuery = useQuery(
    ["fetchProgressRecall", { project_id: props.project_id }],
    ProjectAPI.fetchProgressRecall,
    { refetchOnWindowFocus: false }
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

  return (
    <Root>
      <Box className={classes.root}>
        <Box sx={{ width: "100%", maxWidth: 960 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={5}>
              {progressQuery.data && (
                <ProgressChart progressQuery={progressQuery} />
              )}
            </Grid>
            <Grid item xs={12} sm={7}>
              <NumberCard progressQuery={progressQuery} />
            </Grid>
          </Grid>
        </Box>
        <ProgressDensityChart progressDensityQuery={progressDensityQuery} />
        <ProgressRecallChart progressRecallQuery={progressRecallQuery} />
      </Box>
      <SpeedDial
        ariaLabel="share project analytics"
        sx={{ position: "absolute", bottom: 24, right: 24 }}
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
}
