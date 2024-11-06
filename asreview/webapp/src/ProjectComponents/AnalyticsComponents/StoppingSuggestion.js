import React from "react";

import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Link,
  Paper,
  Popover,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Chart from "react-apexcharts";

import { ProjectAPI } from "api";
import { useMutation, useQuery, useQueryClient } from "react-query";

const StoppingSuggestion = ({ project_id }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [stoppingRuleThreshold, setStoppingRuleThreshold] =
    React.useState(null);

  const [anchorElEdit, setAnchorElEdit] = React.useState(null);
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);

  const { data, isLoading } = useQuery(
    ["fetchStopping", { project_id: project_id }],
    ProjectAPI.fetchStopping,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setStoppingRuleThreshold(data[0]?.params.threshold);
      },
    },
  );

  const { mutate: updateStoppingRule } = useMutation(
    ProjectAPI.mutateStopping,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries([
          "fetchStopping",
          { project_id: project_id },
        ]);
        handleCloseEdit();
      },
    },
  );

  const handleCloseEdit = () => setAnchorElEdit(null);

  const openEdit = Boolean(anchorElEdit);
  const openInfo = Boolean(anchorElInfo);

  // console.log(data[0]?.value, data[0]?.params?.threshold);

  return (
    <Card
      sx={{
        position: "relative",
        bgcolor: "background.default",
      }}
    >
      <CardContent>
        <Grid container spacing={2} columns={1}>
          <Grid
            size={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box position="relative" display="inline-flex">
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
                    //       labels: {
                    //         show: true,
                    //         total: {
                    //           show: false,
                    //           formatter: () =>
                    //             `${
                    //               data.n_records > 0
                    //                 ? Math.round(
                    //                     (data.n_included +
                    //                       data.n_excluded /
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
                    labels: ["Stopping suggestion", "Remaining"],
                    colors: [
                      theme.palette.mode === "light"
                        ? theme.palette.primary.light
                        : theme.palette.primary.main, // Relevant
                      theme.palette.mode === "light"
                        ? theme.palette.grey[400]
                        : theme.palette.grey[400], // Unlabeled
                    ],
                    stroke: { width: 0 },
                    legend: { show: false },
                    tooltip: {
                      enabled: true,
                    },
                    theme: { mode: theme.palette.mode },
                    dataLabels: { enabled: false },
                  }}
                  series={[
                    data[0]?.value,
                    data[0]?.params?.threshold - data[0]?.value,
                  ]}
                  type="donut"
                  height={180}
                  width={180}
                />
              )}
            </Box>
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
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Typography variant="body2" color="text.secondary">
                      {"Successive not relevant"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {data && data[0]?.value}
                    </Typography>
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
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Typography variant="body2" color="text.secondary">
                      Stopping suggestion
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        setAnchorElEdit(event.currentTarget);
                      }}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {data && (
                      <Popover
                        id="threshold-popover"
                        open={openEdit}
                        anchorEl={anchorElEdit}
                        onClose={handleCloseEdit}
                      >
                        <Stack direction={"column"} spacing={3} p={3}>
                          <Typography variant="h6" gutterBottom>
                            Edit threshold
                          </Typography>
                          <TextField
                            type="number"
                            // value={data[0]?.params.threshold}
                            value={stoppingRuleThreshold}
                            onChange={(e) => {
                              setStoppingRuleThreshold(e.target.value);
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={() =>
                              updateStoppingRule({
                                project_id: project_id,
                                id: "n_since_last_included",
                                threshold: stoppingRuleThreshold,
                              })
                            }
                          >
                            Save
                          </Button>
                        </Stack>
                      </Popover>
                    )}

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {data && data[0]?.params.threshold}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Grid>

          {/* <Box>
            <IconButton
              size="small"
              onClick={(event) => {
                setAnchorElInfo(event.currentTarget);
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box> */}
        </Grid>
      </CardContent>
      <Popover
        id="info-popover"
        open={openInfo}
        anchorEl={anchorElInfo}
        onClose={() => setAnchorElInfo(null)}
      >
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Stopping Suggestion</strong>
          </Typography>
          <Typography variant="body2">
            This feature helps you decide when to stop screening additional
            records. The more irrelevant records you label without encountering
            any relevant ones, the higher the likelihood that the remaining
            records are also irrelevant.
          </Typography>
          <Typography variant="body2">
            You can manually edit and optimize the threshold for your project.
          </Typography>
          <Box>
            <Link
              component="a"
              href="https://github.com/asreview/asreview/discussions/557"
              sx={(theme) => ({ color: theme.palette.primary.main })}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default StoppingSuggestion;
