import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  IconButton,
  Popover,
  Button,
  Grid2 as Grid,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AVG_TIME_PER_RECORD = 1.2;
const ROTATION_INTERVAL = 5000;

const ACTIVITIES = [
  // Repeatable enjoyable activities
  {
    minHours: 11,
    maxHours: 1000,
    getText: (hours) =>
      `Watch the Lord of the Rings extended trilogy ${Math.floor(hours / 11.4)} times`,
    baseHours: 11.4,
  },
  {
    minHours: 15,
    maxHours: 1000,
    getText: (hours) =>
      `Listen to all Beethoven symphonies ${Math.floor(hours / 15)} times`,
    baseHours: 15,
  },
  {
    minHours: 25,
    maxHours: 1000,
    getText: (hours) =>
      `Experience all Studio Ghibli films ${Math.floor(hours / 25)} times`,
    baseHours: 25,
  },

  // Significant one-time achievements
  {
    minHours: 50,
    maxHours: 1000,
    getText: () => `Read the complete works of Jane Austen`,
    baseHours: 50,
    oneTime: true,
  },
  {
    minHours: 100,
    maxHours: 1000,
    getText: () => `Master the art of French cooking from basics to advanced`,
    baseHours: 100,
    oneTime: true,
  },
  {
    minHours: 80,
    maxHours: 1000,
    getText: () =>
      `Take a scenic train journey through five European countries`,
    baseHours: 80,
    oneTime: true,
  },
  {
    minHours: 120,
    maxHours: 1000,
    getText: () => `Learn Italian for your dream Mediterranean adventure`,
    baseHours: 120,
    oneTime: true,
  },

  // Medium-length achievements
  {
    minHours: 40,
    maxHours: 1000,
    getText: () => `Learn the basics of playing violin`,
    baseHours: 40,
    oneTime: true,
  },
  {
    minHours: 30,
    maxHours: 1000,
    getText: () => `Visit every major art museum in Paris`,
    baseHours: 30,
    oneTime: true,
  },

  // Research & Academic
  {
    minHours: 8,
    maxHours: 1000,
    getText: (hours) =>
      `Write ${Math.floor(hours / 8)} research papers you're excited about`,
    baseHours: 8,
  },
  {
    minHours: 2,
    maxHours: 1000,
    getText: (hours) =>
      `Read ${Math.floor(hours / 2)} papers you actually want to read`,
    baseHours: 2,
  },

  // Humorous but relatable
  {
    minHours: 2,
    maxHours: 1000,
    getText: () => `Finally organize those photos from 2019`,
    baseHours: 2,
    oneTime: true,
  },
  {
    minHours: 7,
    maxHours: 1000,
    getText: () => `Wait for your delayed German train`,
    baseHours: 7,
    oneTime: true,
  },
  {
    minHours: 8,
    maxHours: 1000,
    getText: () => `Actually clean out your email inbox`,
    baseHours: 8,
    oneTime: true,
  },
];

const getContextualActivities = (hours) => {
  // Get all valid activities based on hours
  let validActivities = ACTIVITIES.filter(
    (activity) => hours >= activity.minHours && hours <= activity.maxHours,
  ).map((activity) => activity.getText(hours));

  // Shuffle array
  return validActivities.sort(() => Math.random() - 0.5).slice(0, 3); // Get 3 random activities
};

const TimeSavedCard = ({ project_id }) => {
  const theme = useTheme();
  const [activities, setActivities] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [infoAnchorEl, setInfoAnchorEl] = useState(null);

  const { data: progressData, error } = useQuery(
    ["fetchProgress", { project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (!progressData) return;

    const hoursSaved = Math.round(
      (progressData.n_pool * AVG_TIME_PER_RECORD) / 60,
    );
    setActivities(getContextualActivities(hoursSaved));
  }, [progressData]);

  useEffect(() => {
    if (!activities.length) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
        setIsTransitioning(false);
      }, 500);
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, [activities]);

  if (!progressData || error) return null;

  const unlabeledRecords = progressData.n_pool;
  const hoursSaved = Math.round((unlabeledRecords * AVG_TIME_PER_RECORD) / 60);
  const minutesSaved = Math.round(unlabeledRecords * AVG_TIME_PER_RECORD);

  return (
    <Card
      sx={{
        bgcolor: "transparent",
        position: "relative",
        borderRadius: 3,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton
            size="small"
            onClick={(e) => setInfoAnchorEl(e.currentTarget)}
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, md: 5 }}>
            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 20, color: "text.primary" }} />
                <Typography variant="h6" sx={{ fontFamily: "Roboto Serif" }}>
                  Time Saved
                </Typography>
              </Stack>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontFamily: "Roboto Serif",
                }}
              >
                {hoursSaved.toLocaleString()}
                <Typography
                  component="span"
                  variant="h5"
                  sx={{
                    ml: 1,
                    fontWeight: "normal",
                    color: "text.secondary",
                    fontFamily: "Roboto Serif",
                  }}
                >
                  hrs
                </Typography>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                ≈ {Math.round(hoursSaved / 8)} working days
              </Typography>
            </Stack>
          </Grid>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" } }}
          />

          <Grid item size={{ xs: 12, md: 5 }}>
            <Stack spacing={1}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: "Roboto Serif",
                  color: "text.secondary",
                  textAlign: "center",
                }}
              >
                Instead, you can...
              </Typography>

              <Box
                sx={{
                  minHeight: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {activities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "absolute",
                      opacity: index === currentActivityIndex ? 1 : 0,
                      transform: `translateY(${
                        index === currentActivityIndex
                          ? 0
                          : isTransitioning
                            ? "-20px"
                            : "20px"
                      })`,
                      transition: "all 0.5s ease-in-out",
                      textAlign: "center",
                      width: "100%",
                      px: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Roboto Serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {activity}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                {activities.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor:
                        index === currentActivityIndex
                          ? theme.palette.primary.main
                          : theme.palette.grey[300],
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>

      <Popover
        open={Boolean(infoAnchorEl)}
        anchorEl={infoAnchorEl}
        onClose={() => setInfoAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { borderRadius: 2, maxWidth: 375 },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "Roboto Serif", textAlign: "center" }}
            >
              Congratulations!
            </Typography>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Time Saved
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, textAlign: "justify" }}
              >
                This card estimates the time you've saved by using ASReview
                compared to traditional manual screening. By prioritizing
                relevant records, you avoid spending time on those likely to be
                irrelevant.
              </Typography>
              <Alert
                severity="info"
                icon={<AccessTimeIcon fontSize="inherit" />}
              >
                We estimate that manual screening takes an average of{" "}
                <strong>{AVG_TIME_PER_RECORD * 60} seconds</strong> per record.
                You've potentially skipped reviewing{" "}
                <strong>{unlabeledRecords.toLocaleString()}</strong> records,
                saving approximately{" "}
                <strong>{minutesSaved.toLocaleString()} minutes</strong> (
                {hoursSaved.toLocaleString()} hours).
              </Alert>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Maximize Your Efficiency
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify" }}>
                Every hour saved is valuable time reclaimed. This efficiency
                allows you to focus on analyzing relevant findings, pursue new
                research questions, or dedicate time to other important tasks.
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", pt: 1 }}>
              <Button
                href="https://asreview.readthedocs.io/en/latest/guides/active_learning.html"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Learn more about Active Learning
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
};

export default TimeSavedCard;
