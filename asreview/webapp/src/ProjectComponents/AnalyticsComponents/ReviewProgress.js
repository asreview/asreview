import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid2 as Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Box,
  IconButton,
  Popover,
  Divider,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useQuery } from "react-query";
import { PieChart } from "@mui/x-charts/PieChart";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

export default function ReviewProgress({ project_id }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = Boolean(anchorEl);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

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

  const data = progressQuery.data;
  const isLoading = progressQuery.isLoading || genericDataQuery.isLoading;

  // Determine if priors actually exist based on the fetched data
  const includePrior = data
    ? data.n_included !== data.n_included_no_priors ||
      data.n_excluded !== data.n_excluded_no_priors
    : false;

  const pieData = !data
    ? []
    : [
        {
          label: "Not Relevant",
          value:
            data.n_excluded_no_priors > 0 &&
            data.n_excluded_no_priors / data.n_records_no_priors < 0.005
              ? data.n_records_no_priors * 0.005
              : data.n_excluded_no_priors,
          color: theme.palette.grey[600],
        },
        {
          label: "Relevant",
          value:
            data.n_included_no_priors > 0 &&
            data.n_included_no_priors / data.n_records_no_priors < 0.005
              ? data.n_records_no_priors * 0.005
              : data.n_included_no_priors,
          color: theme.palette.tertiary.dark,
        },
        {
          label: "Unlabeled",
          value:
            data.n_records_no_priors -
            data.n_included_no_priors -
            data.n_excluded_no_priors,
          color: theme.palette.grey[400],
        },
      ];

  const legendData = !data
    ? []
    : [
        {
          label: "Relevant",
          value: data.n_included_no_priors.toLocaleString(),
          priorValue: includePrior ? data.n_included.toLocaleString() : null,
          color: theme.palette.tertiary.dark,
        },
        {
          label: "Not Relevant",
          value: data.n_excluded_no_priors.toLocaleString(),
          priorValue: includePrior ? data.n_excluded.toLocaleString() : null,
          color: theme.palette.grey[600],
        },
        {
          label: "Unlabeled",
          value: (
            data.n_records -
            data.n_included -
            data.n_excluded
          ).toLocaleString(),
          priorValue: null,
          color: theme.palette.grey[400],
        },
      ];

  const staticPieData = [
    {
      label: "Not Relevant",
      value: 25,
      color: theme.palette.grey[600],
    },
    {
      label: "Relevant",
      value: 5,
      color: theme.palette.tertiary.dark,
    },
    {
      label: "Unlabeled",
      value: 70,
      color: theme.palette.grey[400],
    },
  ];

  return (
    <Card sx={{ position: "relative", bgcolor: "transparent" }}>
      <CardContent sx={{ mt: 2 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton size="small" onClick={handlePopoverOpen}>
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2} columns={2}>
          <Grid
            size={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            {isLoading ? (
              <Stack spacing={2}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width="100%"
                    height={30}
                    sx={{ borderRadius: 3 }}
                  />
                ))}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {legendData.map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: item.color,
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flexGrow: 1 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          fontWeight: "bold",
                          ml: 1,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>

                    {includePrior && item.priorValue !== null && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flexGrow: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          (Including priors)
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{
                            fontWeight: "bold",
                            ml: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          ({item.priorValue})
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
          <Grid
            size={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isLoading ? (
              <Box
                width={180}
                height={180}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Skeleton variant="circular" width={160} height={160} />
              </Box>
            ) : (
              <Box>
                <PieChart
                  series={[
                    {
                      data: pieData.map((item) => ({
                        value: item.value,
                        color: item.color,
                      })),
                      innerRadius: 10,
                      outerRadius: 80,
                      paddingAngle: 5,
                      cornerRadius: 10,
                      startAngle: -90,
                      endAngle: 360,
                      cx: 90,
                      cy: 90,
                      highlightScope: {
                        highlighted: "none",
                        faded: "none",
                      },
                    },
                  ]}
                  height={180}
                  width={180}
                  tooltip={{
                    trigger: "none",
                  }}
                  sx={{
                    "& .MuiPieArc-root": {
                      strokeWidth: 0,
                    },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Review Progress
              </Typography>
              <Typography variant="body2" align="justify">
                This visualization shows how far you are from the beginning. It
                displays the number of relevant, not relevant, and unlabeled
                records in your dataset.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Prior Knowledge
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, textAlign: "justify" }}>
                If you have included prior knowledge in your dataset, you will
                also see the number of relevant and not relevant records that
                were included in the prior knowledge.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Example Visualization
              </Typography>
              <Box display="flex" justifyContent="center">
                <PieChart
                  series={[
                    {
                      data: staticPieData.map((item) => ({
                        value: item.value,
                        color: item.color,
                      })),
                      innerRadius: 10,
                      outerRadius: 80,
                      paddingAngle: 5,
                      cornerRadius: 10,
                      startAngle: -150,
                      endAngle: 320,
                      cx: 90,
                      cy: 90,
                      highlightScope: {
                        highlighted: "none",
                        faded: "none",
                      },
                    },
                  ]}
                  height={180}
                  width={180}
                  tooltip={{
                    trigger: "none",
                  }}
                  sx={{
                    "& .MuiPieArc-root": {
                      strokeWidth: 0,
                    },
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                size="small"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
}
