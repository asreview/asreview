import { DoneAll, Share } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  EmailIcon,
  FacebookIcon,
  WeiboIcon,
  WhatsappIcon,
  XIcon,
} from "react-share";

import {
  LabelingFrequency,
  LabelingHistory,
  ProgressDensityChart,
  ProgressRecallChart,
  ReviewProgress,
  ShareFabAction,
  StoppingSuggestion,
  TimeSavedCard,
  WordCounts,
} from "ProjectComponents/AnalyticsComponents";
import { ProjectAPI } from "api";
import { projectStatuses } from "globals.js";

const actions = [
  { icon: <XIcon round />, name: "X" },
  { icon: <FacebookIcon round />, name: "Facebook" },
  { icon: <WeiboIcon round />, name: "Weibo" },
  { icon: <WhatsappIcon round />, name: "WhatsApp" },
  { icon: <EmailIcon round />, name: "Email" },
];

const AnalyticsPage = () => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

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
  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchGenericData({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  const { data: statusData } = useQuery(
    ["fetchProjectStatus", { project_id }],
    ProjectAPI.fetchProjectStatus,
    {
      refetchOnWindowFocus: false,
    },
  );

  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const { mutate: updateStatus } = useMutation(
    (status) =>
      ProjectAPI.mutateReviewStatus({
        project_id: project_id,
        status: status,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchProjectStatus", { project_id }]);
        setOpenStatusDialog(false);
      },
    },
  );

  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);

  const handleFinishProject = () => {
    updateStatus({
      project_id: project_id,
      status: projectStatuses.FINISHED,
    });
    setOpenCompletionDialog(false);
  };

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
  const [activeInsightsTab, setActiveInsightsTab] = useState(0);

  return (
    <Container maxWidth="md" aria-label="analytics page">
      <Stack
        spacing={2}
        className="main-page-body"
        sx={{ pt: { xs: 0, md: 2 } }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            textAlign="center"
            color="text.secondary"
          >
            {progressQuery?.data?.n_records} records •{" "}
            <Chip
              label={
                statusData?.status === projectStatuses.FINISHED
                  ? "Finished"
                  : "In Review"
              }
              icon={
                statusData?.status === projectStatuses.FINISHED ? (
                  <DoneAll />
                ) : null
              }
              variant="outlined"
              color={
                statusData?.status === projectStatuses.FINISHED
                  ? "success"
                  : "inherit"
              }
              onClick={
                data?.mode === "simulate"
                  ? null
                  : () => setOpenStatusDialog(true)
              }
            />
          </Typography>
        </Box>
        <Dialog
          open={openStatusDialog}
          onClose={() => setOpenStatusDialog(false)}
        >
          <DialogTitle>
            {statusData?.status === projectStatuses.FINISHED
              ? "Resume Review"
              : "Mark as Finished"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {statusData?.status === projectStatuses.FINISHED
                ? "Are you sure you want to resume reviewing? This will change the project status back to 'In Review'."
                : "Are you sure you want to mark this project as finished? This indicates that you have completed your review."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                updateStatus(
                  statusData?.status === projectStatuses.FINISHED
                    ? projectStatuses.REVIEW
                    : projectStatuses.FINISHED,
                );
              }}
              variant="contained"
              color="primary"
            >
              {statusData?.status === projectStatuses.FINISHED
                ? "Resume Review"
                : "Mark as Finished"}
            </Button>
          </DialogActions>
        </Dialog>

        <Typography
          variant="h4"
          sx={{
            fontFamily: "Roboto Serif",
            textAlign: "center",
            pb: { xs: 6, md: 10 },
          }}
        >
          {data?.name}
        </Typography>

        {statusData?.status === projectStatuses.FINISHED &&
          data?.mode !== "simulate" && (
            <Grid size={1}>
              <TimeSavedCard project_id={project_id} />
            </Grid>
          )}

        <Grid
          container
          spacing={3}
          columns={{ xs: 1, md: data?.mode === "simulate" ? 1 : 2 }}
        >
          <Grid size={1}>
            <Divider sx={{ pb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: "Roboto Serif" }}>
                Progress
              </Typography>
            </Divider>
            <ReviewProgress project_id={project_id} />
          </Grid>
          {data?.mode !== "simulate" && (
            <Grid size={1}>
              <Divider sx={{ pb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: "Roboto Serif" }}>
                  Stopping
                </Typography>
              </Divider>
              <StoppingSuggestion project_id={project_id} />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ pt: 6, pb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "Roboto Serif" }}>
            Analytics
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

        <Divider sx={{ pt: 6, pb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "Roboto Serif" }}>
            Insights
          </Typography>
        </Divider>
        <Grid size={1}>
          <Tabs
            value={activeInsightsTab}
            onChange={(event, newValue) => setActiveInsightsTab(newValue)}
          >
            <Tab label="Words of Importance" />
          </Tabs>
          {activeInsightsTab === 0 && <WordCounts project_id={project_id} />}
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

      {/* Completion Dialog */}
      <Dialog
        open={openCompletionDialog}
        onClose={() => setOpenCompletionDialog(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DoneAll color="primary" />
          Finish Project
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            Are you sure you want to mark this project as finished? This will
            indicate that you have completed your review.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompletionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFinishProject}
            color="primary"
            variant="contained"
          >
            Finish Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnalyticsPage;
