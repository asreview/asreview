import {
  Card,
  CardContent,
  Divider,
  Grid2 as Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ProjectAPI } from "api";
import { useState } from "react";
import Chart from "react-apexcharts";
import { useQuery } from "react-query";
import { StyledHelpPopover } from "StyledComponents/StyledHelpPopover";

export default function ReviewProgress({ project_id }) {
  const theme = useTheme();

  const { data, isLoading } = useQuery(
    ["fetchProgress", { project_id: project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const popoverOpen = Boolean(anchorEl);

  const hasPrior =
    data?.n_included_no_priors !== data?.n_included ||
    data?.n_excluded_no_priors !== data?.n_excluded;

  return (
    <Card sx={{ bgcolor: "background.default" }}>
      <CardContent>
        <>
          {/* <IconButton
            size="small"
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
            sx={{ float: "right" }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton> */}
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
        <Grid container spacing={2} columns={1}>
          <Grid
            size={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {isLoading ? (
              <Skeleton variant="circular" width={180} height={180} />
            ) : (
              <Chart
                options={{
                  chart: {
                    background: "transparent",
                    type: "donut",
                  },
                  // plotOptions: {
                  //   pie: {
                  //     donut: {
                  //       size: "10%",
                  //       labels: {
                  //         show: false,
                  //         total: {
                  //           show: false,
                  //           formatter: () =>
                  //             `${
                  //               data.n_records > 0
                  //                 ? Math.round(
                  //                     (data.n_included_no_priors +
                  //                       data.n_excluded_no_priors /
                  //                         data.n_records) *
                  //                       100,
                  //                   )
                  //                 : 0
                  //             }%`,
                  //           style: {
                  //             fontSize: "28px",
                  //             fontWeight: "bold",
                  //             color: theme.palette.text.primary,
                  //             textAlign: "center",
                  //           },
                  //         },
                  //       },
                  //     },
                  //   },
                  // },
                  labels: ["Relevant", "Irrelevant", "Unlabeled"],
                  colors: [
                    theme.palette.mode === "light"
                      ? theme.palette.primary.light
                      : theme.palette.primary.main, // Relevant
                    theme.palette.mode === "light"
                      ? theme.palette.grey[600]
                      : theme.palette.grey[600], // Irrelevant
                    theme.palette.mode === "light"
                      ? theme.palette.grey[400]
                      : theme.palette.grey[400], // Unlabeled
                  ],
                  stroke: { width: 0 },
                  legend: { show: false },
                  tooltip: {
                    enabled: true,
                    y: {
                      formatter: (val) =>
                        `${val} (${Math.round((val / data.n_records) * 1000) / 10}%)`,
                    },
                  },
                  theme: { mode: theme.palette.mode },
                  dataLabels: { enabled: false },
                }}
                series={[
                  data.n_included_no_priors,
                  data.n_excluded_no_priors,
                  data.n_records -
                    data.n_included_no_priors -
                    data.n_excluded_no_priors,
                ]}
                type="donut"
                height={180}
                width={180}
              />
            )}
          </Grid>
          <Grid size={1}>
            {data && (
              <Stack spacing={2} direction={"row"}>
                <Paper
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: { xs: 1, sm: 2 },
                  }}
                >
                  <Stack spacing={1} direction={"column"}>
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                      <Typography variant="body2" color="text.secondary">
                        {"Labeled relevant"}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.secondary"
                      >
                        {data.n_included_no_priors}
                      </Typography>
                    </Stack>

                    {hasPrior && (
                      <>
                        <Divider />
                        <Stack
                          direction={"row"}
                          spacing={1}
                          alignItems={"center"}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {"Including priors"}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            {data.n_included}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Paper>
                <Paper
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: { xs: 1, sm: 2 },
                  }}
                >
                  <Stack spacing={1} direction={"column"}>
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
                      <Typography variant="body2" color="text.secondary">
                        {"Labeled not relevant"}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.secondary"
                      >
                        {data.n_excluded_no_priors}
                      </Typography>
                    </Stack>
                    {hasPrior && (
                      <>
                        <Divider />
                        <Stack
                          direction={"row"}
                          spacing={1}
                          alignItems={"center"}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {"Including priors"}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            {data.n_excluded}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
