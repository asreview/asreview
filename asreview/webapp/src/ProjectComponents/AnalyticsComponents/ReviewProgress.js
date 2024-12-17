import {
  Card,
  CardContent,
  Grid2 as Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useState } from "react";
import { useQuery } from "react-query";
import { StyledHelpPopover } from "StyledComponents/StyledHelpPopover";
import { PieChart } from "@mui/x-charts/PieChart";

export default function ReviewProgress({ project_id }) {
  const theme = useTheme();

  // We can implement this fully when we decide on the prior knowledge button
  // const [includePrior, setIncludePrior] = useState(true); // Change to true to test
  const includePrior = true;

  const progressQuery = useQuery(
    ["fetchProgress", { project_id, includePrior }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id, includePrior }],
    ({ queryKey }) =>
      ProjectAPI.fetchGenericData({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = Boolean(anchorEl);
  const data = progressQuery.data;
  const isLoading = progressQuery.isLoading || genericDataQuery.isLoading;

  const pieData = !data
    ? []
    : [
        {
          label: "Not Relevant",
          value: data.n_excluded_no_priors,
          color:
            theme.palette.mode === "light"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
        },
        {
          label: "Relevant",
          value: data.n_included_no_priors,
          color:
            theme.palette.mode === "light"
              ? theme.palette.grey[600]
              : theme.palette.grey[600],
        },
        {
          label: "Unlabeled",
          value:
            data.n_records -
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
          value: data.n_included_no_priors,
          priorValue: includePrior ? data.n_included : null,
          color:
            theme.palette.mode === "light"
              ? theme.palette.grey[600]
              : theme.palette.grey[600],
        },
        {
          label: "Not Relevant",
          value: data.n_excluded_no_priors,
          priorValue: includePrior ? data.n_excluded : null,
          color:
            theme.palette.mode === "light"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
        },
        {
          label: "Unlabeled",
          value:
            data.n_records -
            data.n_included_no_priors -
            data.n_excluded_no_priors,
          priorValue: includePrior ? null : null,
          color: theme.palette.grey[400],
        },
      ];

  return (
    <Card sx={{ m: 0, p: 0, bgcolor: "background.default" }}>
      <CardContent sx={{ m: 0, p: 0, bgcolor: "background.default" }}>
        <>
          <StyledHelpPopover
            id="info-popover"
            open={popoverOpen}
            anchorEl={anchorEl}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <Typography variant="body1">
              <strong>Showing</strong> prior knowledge will show combined
              labelings from the original dataset and those done using ASReview.
            </Typography>
            <Link
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener"
            >
              Learn more
            </Link>
          </StyledHelpPopover>
        </>
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
                      alignItems: "center",
                      width: "100%",
                      backgroundColor: "transparent",
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
                      fontWeight="bold"
                    >
                      {item.value}
                      {item.priorValue !== null && includePrior
                        ? ` (${item.priorValue})`
                        : ""}
                    </Typography>
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
                      innerRadius: 20,
                      outerRadius: 80,
                      paddingAngle: 10,
                      cornerRadius: 10,
                      startAngle: -110,
                      endAngle: 275,
                      cx: 90,
                      cy: 90,
                    },
                  ]}
                  height={180}
                  width={180}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
